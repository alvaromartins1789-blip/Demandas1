import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetPasswordRequest {
  user_email: string;
  user_id: string;
  action: 'send_reset_email' | 'generate_link' | 'generate_temp_password';
}

// Generate a random temporary password
function generateTempPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user's token to verify permissions
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super_admin
    const { data: roleData, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    if (roleError || !roleData) {
      console.error('User is not super_admin:', roleError);
      return new Response(
        JSON.stringify({ error: 'Apenas super admins podem resetar senhas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { user_email, user_id, action }: ResetPasswordRequest = await req.json();

    if (!user_email) {
      return new Response(
        JSON.stringify({ error: 'Email do usuário é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.email} requesting password reset for ${user_email}, action: ${action}`);

    // Admin client with service role key for password operations
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get the origin from request headers for redirect URL
    const origin = req.headers.get('origin') || 'https://lovable.dev';
    const redirectUrl = `${origin}/reset-password`;

    if (action === 'generate_temp_password') {
      // Generate a temporary password
      const tempPassword = generateTempPassword(12);
      
      // Get user by email to get their ID
      const { data: userData, error: getUserError } = await adminClient.auth.admin.listUsers();
      
      if (getUserError) {
        console.error('Error getting users:', getUserError);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar usuário' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const targetUser = userData.users.find(u => u.email === user_email);
      
      if (!targetUser) {
        console.error('User not found:', user_email);
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update user password using admin API
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        targetUser.id,
        { password: tempPassword }
      );
      
      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Set must_change_password flag in profiles table
      const { error: profileError } = await adminClient
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', targetUser.id);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't fail the request, just log the error
      }
      
      console.log(`Temporary password generated for ${user_email}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          temp_password: tempPassword,
          message: 'Senha temporária gerada com sucesso. O usuário deverá trocar a senha no próximo login.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (action === 'send_reset_email') {
      // Send password reset email using admin API
      const { error: resetError } = await adminClient.auth.resetPasswordForEmail(
        user_email,
        { redirectTo: redirectUrl }
      );

      if (resetError) {
        console.error('Error sending reset email:', resetError);
        return new Response(
          JSON.stringify({ error: resetError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Password reset email sent to ${user_email}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email de redefinição enviado para ${user_email}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'generate_link') {
      // Generate a password reset link
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: user_email,
        options: { redirectTo: redirectUrl }
      });

      if (linkError) {
        console.error('Error generating reset link:', linkError);
        return new Response(
          JSON.stringify({ error: linkError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Password reset link generated for ${user_email}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          link: linkData?.properties?.action_link,
          message: 'Link de redefinição gerado com sucesso'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Ação inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Admin reset password error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});