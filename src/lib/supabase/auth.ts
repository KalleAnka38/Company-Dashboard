import { supabase, handleSupabaseError } from './client';
import { logSecurityEvent } from '../security/logger';
import { User } from '@supabase/supabase-js';
/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logSecurityEvent({
      type: 'AUTH',
      level: 'ERROR',
      message: 'Failed to get current user',
      data: {
        error: (error as Error).message
      }
    });
    return null;
  }
}
/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      logSecurityEvent({
        type: 'AUTH',
        level: 'WARNING',
        message: 'Sign in failed',
        data: {
          email,
          error: error.message
        }
      });
      throw error;
    }
    logSecurityEvent({
      type: 'AUTH',
      level: 'INFO',
      message: 'User signed in successfully',
      data: {
        userId: data.user?.id,
        email
      }
    });
    return data;
  } catch (error) {
    return handleSupabaseError(error, 'Sign in failed');
  }
}
/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  try {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    if (error) {
      logSecurityEvent({
        type: 'AUTH',
        level: 'WARNING',
        message: 'Sign up failed',
        data: {
          email,
          error: error.message
        }
      });
      throw error;
    }
    // Create user profile if sign up was successful
    if (data.user) {
      await createUserProfile(data.user.id, email, fullName);
    }
    logSecurityEvent({
      type: 'AUTH',
      level: 'INFO',
      message: 'User signed up successfully',
      data: {
        userId: data.user?.id,
        email
      }
    });
    return data;
  } catch (error) {
    return handleSupabaseError(error, 'Sign up failed');
  }
}
/**
 * Create a user profile
 */
async function createUserProfile(id: string, email: string, fullName?: string) {
  try {
    const {
      error
    } = await supabase.from('user_profiles').insert({
      id,
      email,
      full_name: fullName
    });
    if (error) {
      logSecurityEvent({
        type: 'AUTH',
        level: 'WARNING',
        message: 'Failed to create user profile',
        data: {
          userId: id,
          error: error.message
        }
      });
      throw error;
    }
  } catch (error) {
    logSecurityEvent({
      type: 'AUTH',
      level: 'ERROR',
      message: 'Failed to create user profile',
      data: {
        userId: id,
        error: (error as Error).message
      }
    });
    // We don't throw here to avoid blocking the sign-up process
    // The profile can be created later
  }
}
/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      logSecurityEvent({
        type: 'AUTH',
        level: 'WARNING',
        message: 'Sign out failed',
        data: {
          error: error.message
        }
      });
      throw error;
    }
    logSecurityEvent({
      type: 'AUTH',
      level: 'INFO',
      message: 'User signed out successfully'
    });
  } catch (error) {
    return handleSupabaseError(error, 'Sign out failed');
  }
}
/**
 * Send a password reset email
 */
export async function resetPassword(email: string) {
  try {
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      logSecurityEvent({
        type: 'AUTH',
        level: 'WARNING',
        message: 'Password reset request failed',
        data: {
          email,
          error: error.message
        }
      });
      throw error;
    }
    logSecurityEvent({
      type: 'AUTH',
      level: 'INFO',
      message: 'Password reset email sent',
      data: {
        email
      }
    });
  } catch (error) {
    return handleSupabaseError(error, 'Password reset failed');
  }
}
/**
 * Update the user's password
 */
export async function updatePassword(password: string) {
  try {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    if (error) {
      logSecurityEvent({
        type: 'AUTH',
        level: 'WARNING',
        message: 'Password update failed',
        data: {
          error: error.message
        }
      });
      throw error;
    }
    logSecurityEvent({
      type: 'AUTH',
      level: 'INFO',
      message: 'Password updated successfully'
    });
  } catch (error) {
    return handleSupabaseError(error, 'Password update failed');
  }
}