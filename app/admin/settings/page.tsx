import { requireSuperAdmin } from "@/lib/admin";
import { AdminSettingsView } from "@/components/admin/settings-view";
import { createServiceClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { user } = await requireSuperAdmin();
  const serviceClient = await createServiceClient();

  const { data: brandingRow } = await serviceClient
    .from("platform_settings")
    .select("value")
    .eq("key", "branding")
    .maybeSingle();

  const { data: featuresRow } = await serviceClient
    .from("platform_settings")
    .select("value")
    .eq("key", "features")
    .maybeSingle();

  const { data: apiKeysRow } = await serviceClient
    .from("platform_settings")
    .select("value")
    .eq("key", "api_keys")
    .maybeSingle();

  const branding = (brandingRow?.value as any) || {
    app_name: siteConfig.name,
    tagline: siteConfig.tagline,
    support_email: siteConfig.supportEmail,
    company_name: siteConfig.companyName,
  };

  const features = (featuresRow?.value as any) || {
    allow_signup: true,
    default_trial_days: 14,
  };

  const apiKeys = (apiKeysRow?.value as any) || {
    zernio_api_key: process.env.ZERNIO_API_KEY ? "••••••••••••••••" : "",
    oauth_state_secret: process.env.OAUTH_STATE_SECRET ? "••••••••••••••••" : "",
    cron_secret: process.env.CRON_SECRET ? "••••••••••••••••" : "",
  };

  const systemStatus = {
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    zernioConfigured: !!process.env.ZERNIO_API_KEY,
    cronConfigured: !!process.env.CRON_SECRET,
    aiGatewayConfigured: !!process.env.AI_GATEWAY_API_KEY,
  };

  return (
    <AdminSettingsView
      branding={branding}
      features={features}
      apiKeys={apiKeys}
      systemStatus={systemStatus}
      currentAdminId={user.id}
    />
  );
}
