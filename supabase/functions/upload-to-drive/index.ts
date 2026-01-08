import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken!,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Token refresh error:', data);
    throw new Error(`Failed to refresh token: ${data.error_description || data.error}`);
  }
  
  return data.access_token;
}

async function uploadToDrive(accessToken: string, fileContent: Uint8Array, fileName: string, mimeType: string): Promise<{ id: string; webViewLink: string }> {
  const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
  
  const metadata = {
    name: fileName,
    parents: folderId ? [folderId] : [],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const metadataString = JSON.stringify(metadata);
  
  // Build multipart body
  const encoder = new TextEncoder();
  const metadataPart = encoder.encode(
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    metadataString
  );
  
  const filePart = encoder.encode(
    delimiter +
    'Content-Type: ' + mimeType + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n'
  );
  
  // Convert file content to base64
  const base64Content = btoa(String.fromCharCode(...fileContent));
  const base64Part = encoder.encode(base64Content);
  
  const closePart = encoder.encode(closeDelim);
  
  // Combine all parts
  const body = new Uint8Array(metadataPart.length + filePart.length + base64Part.length + closePart.length);
  body.set(metadataPart, 0);
  body.set(filePart, metadataPart.length);
  body.set(base64Part, metadataPart.length + filePart.length);
  body.set(closePart, metadataPart.length + filePart.length + base64Part.length);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: body,
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Drive upload error:', data);
    throw new Error(`Failed to upload to Drive: ${data.error?.message || 'Unknown error'}`);
  }

  // Make file publicly viewable
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  return {
    id: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file || !orderId) {
      return new Response(
        JSON.stringify({ error: 'File and orderId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing upload for order: ${orderId}, file: ${file.name}`);

    // Get access token
    const accessToken = await getAccessToken();

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `payment-proof_${orderId}_${timestamp}_${file.name}`;

    // Upload to Google Drive
    const driveResult = await uploadToDrive(accessToken, fileContent, fileName, file.type);

    console.log(`File uploaded to Drive: ${driveResult.id}`);

    // Update booking in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_proof_url: driveResult.webViewLink,
        payment_proof_drive_id: driveResult.id,
        payment_status: 'waiting_verification',
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        driveUrl: driveResult.webViewLink,
        driveId: driveResult.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});