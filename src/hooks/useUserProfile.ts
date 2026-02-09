import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { themes } from '../components/themes';

const STORAGE_KEYS = {
    PROFILE: 'app_profile_v2',
    RENTAL_GOAL: 'app_rental_goal_v2',
    SALES_GOAL: 'app_sales_goal_v2',
    THEME: 'app-theme-v4',
    ONBOARDING: 'hasSeenOnboarding'
};

export const useUserProfile = (session: Session | null) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile from database
    const fetchProfile = useCallback(async () => {
        if (!session?.user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('UserProfiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                // Profile doesn't exist, create it
                if (error.code === 'PGRST116') {
                    await createProfile(session.user.id, session.user.email || '');
                } else {
                    throw error;
                }
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Create new profile (with migration from localStorage)
    const createProfile = async (userId: string, email: string) => {
        try {
            // Try to migrate from localStorage
            const localProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
            const localRentalGoal = localStorage.getItem(STORAGE_KEYS.RENTAL_GOAL);
            const localSalesGoal = localStorage.getItem(STORAGE_KEYS.SALES_GOAL);
            const localTheme = localStorage.getItem(STORAGE_KEYS.THEME);
            const localOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING);

            let name = 'Corretor Pro';
            let avatar: string | undefined;
            let phone = '(11) 99999-8888';
            let rentalGoal = 100;
            let salesGoal = 20;
            let themeName = 'Violet';
            let hasSeenOnboarding = false;

            // Migrate from localStorage if exists
            if (localProfile) {
                const parsed = JSON.parse(localProfile);
                name = parsed.name || name;
                avatar = parsed.avatar;
                phone = parsed.phone || phone;
            }

            if (localRentalGoal) {
                rentalGoal = JSON.parse(localRentalGoal);
            }

            if (localSalesGoal) {
                salesGoal = JSON.parse(localSalesGoal);
            }

            if (localTheme) {
                const parsed = JSON.parse(localTheme);
                themeName = parsed.name || themeName;
            }

            if (localOnboarding) {
                hasSeenOnboarding = localOnboarding === 'true';
            }

            const { data, error } = await supabase
                .from('UserProfiles')
                .insert({
                    user_id: userId,
                    name,
                    avatar,
                    phone,
                    rental_goal: rentalGoal,
                    sales_goal: salesGoal,
                    theme_name: themeName,
                    has_seen_onboarding: hasSeenOnboarding,
                    two_factor_enabled: false
                })
                .select()
                .single();

            if (error) throw error;

            setProfile(data);

            // Clear localStorage after successful migration
            localStorage.removeItem(STORAGE_KEYS.PROFILE);
            localStorage.removeItem(STORAGE_KEYS.RENTAL_GOAL);
            localStorage.removeItem(STORAGE_KEYS.SALES_GOAL);
            localStorage.removeItem(STORAGE_KEYS.THEME);
            localStorage.removeItem(STORAGE_KEYS.ONBOARDING);

            console.log('Profile migrated from localStorage to database');
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    };

    // Update profile
    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        if (!session?.user || !profile) return;

        try {
            const { data, error } = await supabase
                .from('UserProfiles')
                .update(updates)
                .eq('user_id', session.user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }, [session, profile]);

    // Fetch profile on mount and when session changes
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Real-time subscription
    useEffect(() => {
        if (!session?.user) return;

        const channel = supabase
            .channel('userprofile-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'UserProfiles',
                    filter: `user_id=eq.${session.user.id}`
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setProfile(payload.new as UserProfile);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session]);

    return {
        profile,
        loading,
        updateProfile,
        refreshProfile: fetchProfile
    };
};
