import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface AffiliateState {
  affiliateCode: string | null;
  isTracking: boolean;
  hasTracked: boolean;
}

export function useAffiliate() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [affiliateState, setAffiliateState] = useState<AffiliateState>({
    affiliateCode: null,
    isTracking: false,
    hasTracked: false,
  });

  useEffect(() => {
    const handleAffiliateTracking = async () => {
      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');

      if (!refCode) {
        // Check if we have a stored affiliate code
        const storedCode = localStorage.getItem('affiliate_ref');
        if (storedCode) {
          setAffiliateState(prev => ({
            ...prev,
            affiliateCode: storedCode,
          }));
        }
        return;
      }

      // Prevent multiple tracking attempts for the same code
      const trackedKey = `affiliate_tracked_${refCode}`;
      if (localStorage.getItem(trackedKey)) {
        setAffiliateState(prev => ({
          ...prev,
          affiliateCode: refCode,
          hasTracked: true,
        }));
        return;
      }

      setAffiliateState(prev => ({
        ...prev,
        affiliateCode: refCode,
        isTracking: true,
      }));

      try {
        // First check if the affiliate code is valid and not self-referral
        try {
          const affiliateCheckResponse = await apiRequest('GET', `/api/affiliate/code/${refCode}`) as any;
          if (affiliateCheckResponse.valid) {
            // If user is authenticated, check if they're not trying to use their own code
            if (isAuthenticated && user) {
              try {
                const userAffiliateResponse = await apiRequest('GET', '/api/affiliate/dashboard') as any;
                if (userAffiliateResponse.affiliate?.affiliateCode === refCode) {
                  console.log('Self-referral attempt blocked - user cannot use their own affiliate code');
                  localStorage.removeItem('affiliate_ref');
                  setAffiliateState(prev => ({
                    ...prev,
                    affiliateCode: null,
                    isTracking: false,
                  }));
                  return;
                }
              } catch (dashboardError) {
                // User might not be an affiliate yet, continue with tracking
                console.log('User not an affiliate yet, proceeding with referral tracking');
              }
            }
          }
        } catch (checkError) {
          console.error('Error checking affiliate code:', checkError);
          // Continue with tracking even if check fails
        }

        // Track the affiliate click
        await apiRequest('POST', '/api/affiliate/track-click', {
          ref: refCode,
        });

        // Store affiliate code for future use
        localStorage.setItem('affiliate_ref', refCode);
        localStorage.setItem(trackedKey, 'true');
        
        // Set expiration for tracking (24 hours)
        setTimeout(() => {
          localStorage.removeItem(trackedKey);
        }, 24 * 60 * 60 * 1000);

        setAffiliateState(prev => ({
          ...prev,
          isTracking: false,
          hasTracked: true,
        }));

        console.log(`Affiliate click tracked for code: ${refCode}`);
      } catch (error) {
        console.error('Failed to track affiliate click:', error);
        setAffiliateState(prev => ({
          ...prev,
          isTracking: false,
        }));
      }
    };

    handleAffiliateTracking();
  }, [location]);

  const getStoredAffiliateCode = (): string | null => {
    return localStorage.getItem('affiliate_ref');
  };

  const clearAffiliateCode = () => {
    localStorage.removeItem('affiliate_ref');
    setAffiliateState({
      affiliateCode: null,
      isTracking: false,
      hasTracked: false,
    });
  };

  const isAffiliateReferral = (): boolean => {
    return !!affiliateState.affiliateCode;
  };

  return {
    affiliateCode: affiliateState.affiliateCode,
    isTracking: affiliateState.isTracking,
    hasTracked: affiliateState.hasTracked,
    isAffiliateReferral,
    getStoredAffiliateCode,
    clearAffiliateCode,
  };
}