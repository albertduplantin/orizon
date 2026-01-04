import { db } from "@/db";
import { channels, channelMembers, messages, tenantMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface ModuleChannelConfig {
  moduleId: string;
  essentialChannels: {
    name: string;
    slug: string;
    type: 'public' | 'private' | 'broadcast';
    description: string;
    autoMembers?: 'all' | 'role-based';
    requiredRole?: string;
  }[];
  onDemandChannels?: {
    category: string;
    examples: string[];
  };
}

const MODULE_CHANNEL_CONFIGS: ModuleChannelConfig[] = [
  {
    moduleId: 'communication',
    essentialChannels: [
      {
        name: 'Général',
        slug: 'general',
        type: 'public',
        description: 'Discussions générales de l\'équipe',
        autoMembers: 'all',
      },
      {
        name: 'Annonces',
        slug: 'announcements',
        type: 'broadcast',
        description: 'Annonces importantes (admins seulement)',
        autoMembers: 'all',
      },
    ],
  },
  {
    moduleId: 'volunteers',
    essentialChannels: [
      {
        name: 'Coordination Bénévoles',
        slug: 'volunteer-coordination',
        type: 'public',
        description: 'Discussion générale et coordination des bénévoles',
        autoMembers: 'all',
      },
    ],
    onDemandChannels: {
      category: 'shifts',
      examples: ['#shift-morning', '#shift-afternoon', '#shift-evening'],
    },
  },
  {
    moduleId: 'sponsors',
    essentialChannels: [
      {
        name: 'Liaison Sponsors',
        slug: 'sponsor-liaison',
        type: 'private',
        description: 'Communication avec les contacts sponsors',
        requiredRole: 'tenant_admin',
      },
    ],
  },
];

export async function provisionModuleChannels(
  tenantId: string,
  moduleId: string,
  userId: string
) {
  const config = MODULE_CHANNEL_CONFIGS.find(c => c.moduleId === moduleId);
  if (!config) return [];

  const createdChannels = [];

  for (const channelDef of config.essentialChannels) {
    // Vérifier si existe déjà
    const existing = await db.query.channels.findFirst({
      where: and(
        eq(channels.tenantId, tenantId),
        eq(channels.slug, channelDef.slug)
      ),
    });

    if (existing) continue;

    // Créer le channel
    const [channel] = await db.insert(channels).values({
      tenantId,
      moduleId,
      name: channelDef.name,
      slug: channelDef.slug,
      type: channelDef.type,
      description: channelDef.description,
      createdBy: userId,
    }).returning();

    // Auto-ajouter les membres
    if (channelDef.autoMembers === 'all') {
      const members = await db.query.tenantMembers.findMany({
        where: eq(tenantMembers.tenantId, tenantId),
      });

      if (members.length > 0) {
        await db.insert(channelMembers).values(
          members.map(m => ({
            channelId: channel.id,
            userId: m.userId,
            tenantId,
            role: m.role === 'tenant_admin' ? 'admin' as const : 'member' as const,
          }))
        );
      }
    }

    // Message de bienvenue (utilise l'userId du créateur pour éviter les contraintes FK)
    await db.insert(messages).values({
      channelId: channel.id,
      tenantId,
      userId: userId,
      type: 'system',
      content: `Bienvenue dans **${channelDef.name}**! ${channelDef.description}`,
    });

    createdChannels.push(channel);
  }

  return createdChannels;
}

export async function createOnDemandChannel(
  tenantId: string,
  moduleId: string,
  channelName: string,
  channelType: 'public' | 'private',
  userId: string
) {
  const slug = `${moduleId}-${channelName.toLowerCase().replace(/\s+/g, '-')}`;

  const [channel] = await db.insert(channels).values({
    tenantId,
    moduleId,
    name: channelName,
    slug,
    type: channelType,
    createdBy: userId,
    autoArchiveAfterDays: 7, // Auto-archive après 7 jours inactivité
  }).returning();

  // Créateur devient admin du channel
  await db.insert(channelMembers).values({
    channelId: channel.id,
    userId,
    tenantId,
    role: 'admin',
  });

  return channel;
}
