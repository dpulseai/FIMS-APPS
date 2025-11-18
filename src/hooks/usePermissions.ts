import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { UserPermission, UserProfile } from '../types';

export interface PermissionCheck {
  hasAccess: (app: string, permission?: 'read' | 'write' | 'delete' | 'admin') => boolean;
  permissions: UserPermission[];
  userRole: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export const usePermissions = (user: User | null): PermissionCheck => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setUserRole(null);
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: userRolesData, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            name,
            phone_number,
            role_id,
            roles!inner(name, description)
          `)
          .eq('user_id', user.id);

        if (userRolesError) {
          console.error('Error fetching user roles:', userRolesError);
          throw userRolesError;
        }

        const roleIds = userRolesData?.map(ur => ur.role_id) || [];
        const primaryRole = userRolesData?.[0]?.roles?.name || null;
        const roleDescription = userRolesData?.[0]?.roles?.description || null;

        setUserRole(primaryRole);

        let permissionsData: UserPermission[] = [];
        if (roleIds.length > 0) {
          const { data: permsData, error: permsError } = await supabase
            .from('application_permissions')
            .select(`
              application_name,
              can_read,
              can_write,
              can_delete,
              can_admin,
              roles!inner(name)
            `)
            .in('role_id', roleIds);

          if (permsError) {
            console.error('Error fetching permissions:', permsError);
            permissionsData = [];
          } else {
            permissionsData = permsData?.map(p => ({
              application_name: p.application_name,
              can_read: p.can_read,
              can_write: p.can_write,
              can_delete: p.can_delete,
              can_admin: p.can_admin,
              role_name: p.roles?.name || primaryRole || 'unknown'
            })) || [];
          }
        }

        setPermissions(permissionsData);

        const primaryUserRole = userRolesData?.[0];
        setUserProfile({
          name: primaryUserRole?.name || null,
          role_name: primaryRole,
          role_description: roleDescription,
          email: user.email || null,
          phone_number: primaryUserRole?.phone_number || null
        });

      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
        setUserProfile({
          name: null,
          role_name: null,
          role_description: null,
          email: user?.email || null,
          phone_number: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasAccess = (app: string, permission: 'read' | 'write' | 'delete' | 'admin' = 'read'): boolean => {
    const appPermission = permissions.find(p => p.application_name === app);
    if (!appPermission) return false;

    switch (permission) {
      case 'read':
        return appPermission.can_read;
      case 'write':
        return appPermission.can_write;
      case 'delete':
        return appPermission.can_delete;
      case 'admin':
        return appPermission.can_admin;
      default:
        return false;
    }
  };

  return {
    hasAccess,
    permissions,
    userRole,
    userProfile,
    isLoading,
    error
  };
};
