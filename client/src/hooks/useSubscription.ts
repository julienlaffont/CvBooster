import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getQueryFn } from '@/lib/queryClient';

export type SubscriptionPlan = 'debutant' | 'pro' | 'expert';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';

interface SubscriptionInfo {
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface PlanLimits {
  maxCvGenerations: number;
  maxCoverLetterGenerations: number;
  hasAdvancedFeatures: boolean;
  hasCoaching: boolean;
  hasAdvancedAnalytics: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
  hasPhoneSupport: boolean;
}

interface UserUsage {
  cvGenerationsCount: number;
  coverLetterGenerationsCount: number;
  canGenerateCV: boolean;
  canGenerateCoverLetter: boolean;
}

const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  debutant: {
    maxCvGenerations: 3,
    maxCoverLetterGenerations: 3,
    hasAdvancedFeatures: false,
    hasCoaching: false,
    hasAdvancedAnalytics: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
    hasPhoneSupport: false,
  },
  pro: {
    maxCvGenerations: -1, // Unlimited
    maxCoverLetterGenerations: -1, // Unlimited
    hasAdvancedFeatures: true,
    hasCoaching: false,
    hasAdvancedAnalytics: false,
    hasAPIAccess: false,
    hasPrioritySupport: true,
    hasPhoneSupport: false,
  },
  expert: {
    maxCvGenerations: -1, // Unlimited
    maxCoverLetterGenerations: -1, // Unlimited
    hasAdvancedFeatures: true,
    hasCoaching: true,
    hasAdvancedAnalytics: true,
    hasAPIAccess: true,
    hasPrioritySupport: true,
    hasPhoneSupport: true,
  },
};

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();

  // Fetch subscription info from backend
  const {
    data: subscriptionInfo,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery<SubscriptionInfo>({
    queryKey: ['/api/subscription/status'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch user usage info
  const {
    data: userUsage,
    isLoading: isLoadingUsage,
    error: usageError,
  } = useQuery<UserUsage>({
    queryKey: ['/api/user/usage'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for usage
  });

  const currentPlan = subscriptionInfo?.subscriptionPlan || 'debutant';
  const isActive = subscriptionInfo?.subscriptionStatus === 'active';
  const planLimits = PLAN_LIMITS[currentPlan];

  // Helper functions for checking feature access
  const hasFeatureAccess = (feature: keyof PlanLimits): boolean => {
    if (!isAuthenticated) return false;
    
    // For debutant plan, check if subscription is active or if it's the free tier
    if (currentPlan === 'debutant') {
      return planLimits[feature] as boolean;
    }
    
    // For paid plans, check if subscription is active
    return isActive && (planLimits[feature] as boolean);
  };

  const canGenerateCV = (): boolean => {
    if (!isAuthenticated || !userUsage) return false;
    
    if (currentPlan === 'debutant') {
      return userUsage.canGenerateCV;
    }
    
    // Unlimited for paid plans if subscription is active
    return isActive;
  };

  const canGenerateCoverLetter = (): boolean => {
    if (!isAuthenticated || !userUsage) return false;
    
    if (currentPlan === 'debutant') {
      return userUsage.canGenerateCoverLetter;
    }
    
    // Unlimited for paid plans if subscription is active
    return isActive;
  };

  const getRemainingCVGenerations = (): number => {
    if (!userUsage) return 0;
    
    if (currentPlan === 'debutant') {
      const remaining = planLimits.maxCvGenerations - userUsage.cvGenerationsCount;
      return Math.max(0, remaining);
    }
    
    // Unlimited for paid plans
    return -1;
  };

  const getRemainingCoverLetterGenerations = (): number => {
    if (!userUsage) return 0;
    
    if (currentPlan === 'debutant') {
      const remaining = planLimits.maxCoverLetterGenerations - userUsage.coverLetterGenerationsCount;
      return Math.max(0, remaining);
    }
    
    // Unlimited for paid plans
    return -1;
  };

  const isPremiumUser = (): boolean => {
    return isAuthenticated && currentPlan !== 'debutant' && isActive;
  };

  const isLoading = isLoadingSubscription || isLoadingUsage;
  const error = subscriptionError || usageError;

  return {
    // Subscription info
    currentPlan,
    isActive,
    subscriptionInfo,
    userUsage,
    planLimits,
    
    // Loading and error states
    isLoading,
    error,
    
    // Feature access checks
    hasFeatureAccess,
    canGenerateCV: canGenerateCV(),
    canGenerateCoverLetter: canGenerateCoverLetter(),
    remainingCVGenerations: getRemainingCVGenerations(),
    remainingCoverLetterGenerations: getRemainingCoverLetterGenerations(),
    getRemainingCVGenerations,
    getRemainingCoverLetterGenerations,
    isPremiumUser: isPremiumUser(),
    
    // Premium features
    hasAdvancedFeatures: hasFeatureAccess('hasAdvancedFeatures'),
    hasCoaching: hasFeatureAccess('hasCoaching'),
    hasAdvancedAnalytics: hasFeatureAccess('hasAdvancedAnalytics'),
    hasAPIAccess: hasFeatureAccess('hasAPIAccess'),
    hasPrioritySupport: hasFeatureAccess('hasPrioritySupport'),
    hasPhoneSupport: hasFeatureAccess('hasPhoneSupport'),
  };
}