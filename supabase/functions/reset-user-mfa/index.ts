import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetMFARequest {
  targetUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify the caller is a super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the caller's token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if caller is super_admin
    const { data: callerRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'super_admin')
      .single();

    if (!callerRoles) {
      return new Response(
        JSON.stringify({ error: "Only super_admin can reset MFA" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { targetUserId }: ResetMFARequest = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "Target user ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get target user info for logging
    const { data: targetUser } = await supabase.auth.admin.getUserById(targetUserId);
    const targetEmail = targetUser?.user?.email || 'unknown';

    // Get all MFA factors for the target user
    const { data: factorsData, error: factorsError } = await supabase.auth.admin.mfa.listFactors({
      userId: targetUserId,
    });

    if (factorsError) {
      console.error("Error listing factors:", factorsError);
      return new Response(
        JSON.stringify({ error: "Failed to list MFA factors" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete all factors (the API returns an array of factors)
    const factors = factorsData?.factors || [];
    let deletedCount = 0;

    for (const factor of factors) {
      try {
        const { error: deleteError } = await supabase.auth.admin.mfa.deleteFactor({
          userId: targetUserId,
          id: factor.id,
        });

        if (deleteError) {
          console.error(`Error deleting factor ${factor.id}:`, deleteError);
        } else {
          deletedCount++;
        }
      } catch (e) {
        console.error(`Exception deleting factor ${factor.id}:`, e);
      }
    }

    // Update admin_profiles to mark MFA as disabled
    await supabase
      .from('admin_profiles')
      .update({ is_mfa_enabled: false })
      .eq('user_id', targetUserId);

    // Log the activity
    await supabase.from('admin_activity_logs').insert({
      user_email: callerUser.email,
      action: 'mfa_reset',
      details: {
        target_user_id: targetUserId,
        target_email: targetEmail,
        factors_deleted: deletedCount,
        reset_by: callerUser.email,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`MFA reset for user ${targetUserId} by ${callerUser.email}: ${deletedCount} factors deleted`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `MFA berhasil di-reset untuk ${targetEmail}`,
        factorsDeleted: deletedCount 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-user-mfa:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
