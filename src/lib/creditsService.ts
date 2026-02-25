import { supabase } from './supabase';

export interface CreditsInfo {
  credits: number;
  monthly_credits?: number;
}

export async function getFluxCredits(): Promise<CreditsInfo | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: creditsData, error } = await supabase
      .from('user_credits')
      .select('credits, total_credits_purchased')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching credits:', error);
      return null;
    }

    if (!creditsData) {
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, credits: 3, total_credits_purchased: 0 });

      if (insertError) {
        console.error('Error creating credits:', insertError);
        return null;
      }

      return { credits: 3 };
    }

    return {
      credits: Number(creditsData.credits) || 0,
    };
  } catch (err) {
    console.error('Error fetching credits:', err);
    return null;
  }
}
