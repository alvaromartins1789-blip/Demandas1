import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteUserRequest {
  user_id: string;
  user_email: string;
  ban_email: boolean;
  reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user: currentUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super_admin
    const { data: roleData, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('role', 'super_admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Only super admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { user_id, user_email, ban_email, reason }: DeleteUserRequest = await req.json();

    if (!user_id || !user_email) {
      return new Response(
        JSON.stringify({ error: 'user_id and user_email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent deleting yourself
    if (user_id === currentUser.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for user deletion
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // If banning, add email to banned_emails table first
    if (ban_email) {
      const { error: banError } = await adminClient
        .from('banned_emails')
        .insert({
          email: user_email.toLowerCase(),
          banned_by: currentUser.id,
          reason: reason || 'Banned by super admin'
        });

      if (banError && !banError.message.includes('duplicate')) {
        console.error('Error banning email:', banError);
        return new Response(
          JSON.stringify({ error: 'Failed to ban email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete user roles first
    const { error: rolesError } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', user_id);

    if (rolesError) {
      console.error('Error deleting user roles:', rolesError);
    }

    // Delete profile (this should cascade, but let's be explicit)
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', user_id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // Delete the user from auth.users
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete user: ' + deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user_email} deleted successfully. Banned: ${ban_email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: ban_email 
          ? 'User deleted and email banned' 
          : 'User deleted successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-delete-user:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
