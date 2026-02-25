import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateImageRequest {
  prompt: string;
  imageSize?: string;
  seed?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: userError?.message || "Invalid or expired token"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { prompt, imageSize = "landscape_4_3", seed }: GenerateImageRequest = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: creditsData, error: creditsError } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsError) {
      console.error("Credits check error:", creditsError);
      return new Response(
        JSON.stringify({
          error: "Unable to verify credits",
          details: creditsError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!creditsData) {
      const { error: insertError } = await supabaseAdmin
        .from("user_credits")
        .insert({
          user_id: user.id,
          credits: 3,
          total_credits_purchased: 0
        });

      if (insertError) {
        console.error("Failed to create credits record:", insertError);
        return new Response(
          JSON.stringify({
            error: "Unable to initialize credits",
            details: insertError.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Credits initialized. Please try again.",
          credits_granted: 3
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentCredits = Number(creditsData.credits);
    if (currentCredits < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const falApiKey = Deno.env.get("FAL_API_KEY");
    if (!falApiKey) {
      console.error("FAL_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          error: "FAL_API_KEY not configured",
          details: "The FAL_API_KEY secret must be set in Supabase Dashboard > Project Settings > Edge Functions > Manage secrets"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("FAL_API_KEY is configured, proceeding with image generation...");

    const falResponse = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        ...(seed && { seed }),
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error("FAL API error:", falResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to generate image",
          details: errorText,
          status: falResponse.status
        }),
        {
          status: falResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await falResponse.json();
    console.log("FAL response received successfully");

    const { error: deductError } = await supabaseAdmin
      .from("user_credits")
      .update({
        credits: currentCredits - 1
      })
      .eq("user_id", user.id);

    if (deductError) {
      console.error("Failed to deduct credits:", deductError);
    }

    const imageUrl = data.images?.[0]?.url || data.image?.url;
    const generatedSeed = data.seed;

    if (imageUrl) {
      await supabaseAdmin
        .from("image_generations")
        .insert({
          user_id: user.id,
          prompt,
          image_url: imageUrl,
          seed: generatedSeed,
          image_size: imageSize,
          credits_used: 1
        });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in generate-image function:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
