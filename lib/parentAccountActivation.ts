type SupabaseAdmin = any;

type ParentProfile = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  parent_name?: string | null;
  internal_email?: string | null;
  auth_user_id?: string | null;
  account_status?: string | null;
  activation_sent_at?: string | null;
};

type EnsureParentActivationArgs = {
  supabaseAdmin: SupabaseAdmin;
  profile: ParentProfile;
};

type EnsureParentActivationResult = {
  userId: string | null;
  invited: boolean;
  alreadyLinked: boolean;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (!configuredUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL ontbreekt. Voeg de URL van je website toe aan de omgevingsvariabelen."
    );
  }

  const url = configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;

  return url.replace(/\/+$/, "");
}

/**
 * Zoekt een bestaande Supabase Auth-gebruiker op basis van het echte
 * e-mailadres. Dit voorkomt dat een bestaande gebruiker opnieuw wordt
 * uitgenodigd.
 */
async function findAuthUserByEmail({
  supabaseAdmin,
  email,
}: {
  supabaseAdmin: SupabaseAdmin;
  email: string;
}): Promise<any | null> {
  const normalizedEmail = normalizeEmail(email);

  /*
   * Supabase listUsers is gepagineerd.
   * We doorzoeken enkele pagina's en stoppen zodra de gebruiker is gevonden.
   */
  const perPage = 1000;
  const maxPages = 10;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      throw new Error(
        `Het bestaande gebruikersaccount kon niet gecontroleerd worden: ${error.message}`
      );
    }

    const users = Array.isArray(data?.users)
      ? data.users
      : [];

    const match = users.find(
      (user: any) =>
        normalizeEmail(user.email) === normalizedEmail
    );

    if (match) {
      return match;
    }

    if (users.length < perPage) {
      break;
    }
  }

  return null;
}

export async function ensureParentAccountActivation({
  supabaseAdmin,
  profile,
}: EnsureParentActivationArgs): Promise<EnsureParentActivationResult> {
  const profileId = clean(profile.id);
  const email = normalizeEmail(profile.email);

  if (!profileId) {
    throw new Error(
      "Het ouderprofiel heeft geen geldige ID."
    );
  }

  if (!email) {
    throw new Error(
      "Het echte e-mailadres van de ouder ontbreekt."
    );
  }

  /*
   * Het profiel is al aan een Auth-account gekoppeld.
   * Dan sturen we geen nieuwe uitnodiging.
   */
  if (clean(profile.auth_user_id)) {
    return {
      userId: clean(profile.auth_user_id),
      invited: false,
      alreadyLinked: true,
    };
  }

  const existingUser =
    await findAuthUserByEmail({
      supabaseAdmin,
      email,
    });

  /*
   * Er bestaat al een Auth-account met dit echte e-mailadres.
   * We koppelen dit account aan het klantprofiel.
   */
  if (existingUser?.id) {
    const { error: profileUpdateError } =
      await supabaseAdmin
        .from("customer_profiles")
        .update({
          auth_user_id: existingUser.id,
          account_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

    if (profileUpdateError) {
      throw new Error(
        `Het bestaande gebruikersaccount kon niet aan het ouderprofiel gekoppeld worden: ${profileUpdateError.message}`
      );
    }

    return {
      userId: existingUser.id,
      invited: false,
      alreadyLinked: true,
    };
  }

  const firstName =
    clean(profile.first_name);

  const lastName =
    clean(profile.last_name);

  const displayName =
    clean(profile.full_name) ||
    clean(profile.parent_name) ||
    [firstName, lastName].filter(Boolean).join(" ");

  const internalEmail =
    normalizeEmail(profile.internal_email);

  const siteUrl = getSiteUrl();

  const redirectTo =
    `${siteUrl}/auth/callback?next=${encodeURIComponent(
      "/account-activeren"
    )}`;

  /*
   * De uitnodiging gaat naar het echte e-mailadres.
   * Het interne Studio SaGo-adres wordt alleen als metadata bewaard.
   */
  const { data, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: {
          role: "parent",
          profile_id: profileId,
          display_name: displayName,
          first_name: firstName,
          last_name: lastName,
          internal_email: internalEmail,
        },
      }
    );

  if (inviteError) {
    throw new Error(
      `De beveiligde accountuitnodiging kon niet worden verzonden: ${inviteError.message}`
    );
  }

  const userId = clean(data?.user?.id);

  if (!userId) {
    throw new Error(
      "Supabase heeft geen gebruikers-ID teruggegeven na de uitnodiging."
    );
  }

  const { error: profileUpdateError } =
    await supabaseAdmin
      .from("customer_profiles")
      .update({
        auth_user_id: userId,
        account_status: "invited",
        activation_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

  if (profileUpdateError) {
    throw new Error(
      `De uitnodiging werd verzonden, maar het ouderprofiel kon niet worden bijgewerkt: ${profileUpdateError.message}`
    );
  }

  return {
    userId,
    invited: true,
    alreadyLinked: false,
  };
}