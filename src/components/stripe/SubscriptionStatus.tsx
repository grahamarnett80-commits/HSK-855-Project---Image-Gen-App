import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getProductByPriceId } from '../../stripe-config';
import { Crown, AlertCircle } from 'lucide-react';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.price_id) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-600">No active subscription</span>
        </div>
      </div>
    );
  }

  const product = getProductByPriceId(subscription.price_id);
  const isActive = subscription.subscription_status === 'active';
  const periodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : null;

  return (
    <div className={`rounded-lg shadow-md p-4 border ${
      isActive ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Crown className={`w-5 h-5 mr-2 ${isActive ? 'text-green-600' : 'text-yellow-600'}`} />
          <div>
            <div className="font-medium text-gray-900">
              {product?.name || 'Unknown Plan'}
            </div>
            <div className={`text-sm ${isActive ? 'text-green-600' : 'text-yellow-600'}`}>
              Status: {subscription.subscription_status.replace('_', ' ')}
            </div>
          </div>
        </div>
        {periodEnd && (
          <div className="text-right text-sm text-gray-600">
            <div>
              {subscription.cancel_at_period_end ? 'Expires' : 'Renews'}: {periodEnd}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}