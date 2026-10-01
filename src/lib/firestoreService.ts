import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  Campaign,
  UserResponse,
  Transaction,
  WithdrawalRequest,
  BalanceAdjustmentLog,
  PlatformSettings,
  Brand,
  AppNotification,
  BrandInquiry,
  InquiryStatus,
  EmailCampaign,
  NewsletterSubscriber,
  ResearchArticle,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CAMPAIGNS,
  INITIAL_BRANDS,
  INITIAL_TRANSACTIONS,
  INITIAL_WITHDRAWALS,
  INITIAL_RESPONSES,
  INITIAL_ADJUSTMENT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_NEWSLETTER_SUBSCRIBERS,
} from '../data/initialData';
import { INITIAL_RESEARCH_ARTICLES } from '../data/initialResearchArticles';

// Collection references
const USERS_COL = 'users';
const CAMPAIGNS_COL = 'campaigns';
const BRANDS_COL = 'brands';
const RESPONSES_COL = 'responses';
const TRANSACTIONS_COL = 'transactions';
const WITHDRAWALS_COL = 'withdrawals';
const NOTIFICATIONS_COL = 'notifications';
const SETTINGS_COL = 'settings';
const ADJUSTMENTS_COL = 'balance_adjustments';
const BRAND_INQUIRIES_COL = 'brand_inquiries';
const EMAIL_CAMPAIGNS_COL = 'email_campaigns';
const NEWSLETTER_SUBSCRIBERS_COL = 'newsletter_subscribers';
const RESEARCH_ARTICLES_COL = 'research_articles';

// Test connection on boot
if (typeof window !== 'undefined') {
  getDoc(doc(db, 'settings', 'platform')).catch((err) => {
    console.debug('Firestore baseline connectivity check:', err?.message || err);
  });
}

// Seed Initial Data to Firestore if collections are empty or need updating
export async function syncAll100BrandsToFirestore(brandsList: Brand[] = INITIAL_BRANDS): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const b of brandsList) {
      batch.set(doc(db, BRANDS_COL, b.id), cleanData(b), { merge: true });
    }
    await batch.commit();
    console.log(`Successfully synced ${brandsList.length} brands to Firestore.`);
  } catch (err) {
    console.warn('Sync brands to Firestore error:', err);
  }
}

export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COL));
    if (usersSnap.empty) {
      console.log('Seeding initial Firestore database...');
      const batch = writeBatch(db);

      // Seed Users
      for (const u of INITIAL_USERS) {
        batch.set(doc(db, USERS_COL, u.id), u);
      }

      // Seed Campaigns
      for (const c of INITIAL_CAMPAIGNS) {
        batch.set(doc(db, CAMPAIGNS_COL, c.id), c);
      }

      // Seed Brands
      for (const b of INITIAL_BRANDS) {
        batch.set(doc(db, BRANDS_COL, b.id), b);
      }

      // Seed Settings
      batch.set(doc(db, SETTINGS_COL, 'platform'), INITIAL_SETTINGS);

      // Seed Transactions
      for (const t of INITIAL_TRANSACTIONS) {
        batch.set(doc(db, TRANSACTIONS_COL, t.id), t);
      }

      // Seed Withdrawals
      for (const w of INITIAL_WITHDRAWALS) {
        batch.set(doc(db, WITHDRAWALS_COL, w.id), w);
      }

      // Seed Responses
      for (const r of INITIAL_RESPONSES) {
        batch.set(doc(db, RESPONSES_COL, r.id), r);
      }

      // Seed Adjustments
      for (const a of INITIAL_ADJUSTMENT_LOGS) {
        batch.set(doc(db, ADJUSTMENTS_COL, a.id), a);
      }

      // Seed Notifications
      for (const n of INITIAL_NOTIFICATIONS) {
        batch.set(doc(db, NOTIFICATIONS_COL, n.id), n);
      }

      // Seed Newsletter Subscribers (All customers with emails)
      for (const s of INITIAL_NEWSLETTER_SUBSCRIBERS) {
        batch.set(doc(db, NEWSLETTER_SUBSCRIBERS_COL, s.id), cleanData(s));
      }

      await batch.commit();
      console.log('Firestore initial seed completed successfully.');
    } else {
      // Ensure all 100 brands are present even if database was seeded in an earlier migration with fewer brands
      const brandsSnap = await getDocs(collection(db, BRANDS_COL));
      if (brandsSnap.empty || brandsSnap.size < 50) {
        console.log(`Synchronizing ${INITIAL_BRANDS.length} full brands dataset to Firestore...`);
        await syncAll100BrandsToFirestore(INITIAL_BRANDS);
      }

      // Ensure newsletter subscribers collection is seeded with all customer email subscribers if empty
      const newsletterSnap = await getDocs(collection(db, NEWSLETTER_SUBSCRIBERS_COL));
      if (newsletterSnap.empty) {
        console.log(`Synchronizing ${INITIAL_NEWSLETTER_SUBSCRIBERS.length} customer newsletter subscribers to Firestore...`);
        const subBatch = writeBatch(db);
        for (const s of INITIAL_NEWSLETTER_SUBSCRIBERS) {
          subBatch.set(doc(db, NEWSLETTER_SUBSCRIBERS_COL, s.id), cleanData(s));
        }
        await subBatch.commit();
      }

      // Ensure research articles collection is seeded if empty
      const articlesSnap = await getDocs(collection(db, RESEARCH_ARTICLES_COL));
      if (articlesSnap.empty) {
        console.log(`Synchronizing ${INITIAL_RESEARCH_ARTICLES.length} initial brand research studies to Firestore...`);
        const articleBatch = writeBatch(db);
        for (const art of INITIAL_RESEARCH_ARTICLES) {
          articleBatch.set(doc(db, RESEARCH_ARTICLES_COL, art.id), cleanData(art));
        }
        await articleBatch.commit();
      }
    }
  } catch (err) {
    console.warn('Firestore seeding check notice:', err);
  }
}

function cleanData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

function logFirestoreOpError(operation: string, err: any) {
  if (err?.code === 'resource-exhausted' || err?.code === 'unavailable') {
    console.warn(`Firestore ${operation} offline/quota fallback (changes preserved in local state):`, err?.message || err);
  } else {
    console.error(`Failed to ${operation} in Firestore:`, err);
  }
}

// Subscribe to real-time collections
export function subscribeToFirestore(callbacks: {
  onUsers: (users: User[]) => void;
  onCampaigns: (campaigns: Campaign[]) => void;
  onBrands: (brands: Brand[]) => void;
  onResponses: (responses: UserResponse[]) => void;
  onTransactions: (transactions: Transaction[]) => void;
  onWithdrawals: (withdrawals: WithdrawalRequest[]) => void;
  onNotifications: (notifications: AppNotification[]) => void;
  onSettings: (settings: PlatformSettings) => void;
  onAdjustments: (adjustments: BalanceAdjustmentLog[]) => void;
  onError?: (error: any) => void;
}): () => void {
  const unsubs: Unsubscribe[] = [];

  const handleListenerError = (name: string, err: any) => {
    if (err?.code === 'resource-exhausted' || err?.code === 'unavailable') {
      console.warn(`Firestore ${name} listener offline/quota notice (operating in local offline mode):`, err?.message || err);
    } else {
      console.warn(`${name} listener error:`, err);
    }
    callbacks.onError?.(err);
  };

  try {
    // Users
    unsubs.push(
      onSnapshot(
        collection(db, USERS_COL),
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
            callbacks.onUsers(list);
          }
        },
        (err) => handleListenerError('Users', err)
      )
    );

    // Campaigns
    unsubs.push(
      onSnapshot(
        collection(db, CAMPAIGNS_COL),
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Campaign);
            callbacks.onCampaigns(list);
          }
        },
        (err) => handleListenerError('Campaigns', err)
      )
    );

    // Brands
    unsubs.push(
      onSnapshot(
        collection(db, BRANDS_COL),
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Brand);
            callbacks.onBrands(list);
          }
        },
        (err) => handleListenerError('Brands', err)
      )
    );

    // Responses
    unsubs.push(
      onSnapshot(
        collection(db, RESPONSES_COL),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserResponse);
          if (list.length > 0) {
            callbacks.onResponses(list);
          }
        },
        (err) => handleListenerError('Responses', err)
      )
    );

    // Transactions
    unsubs.push(
      onSnapshot(
        collection(db, TRANSACTIONS_COL),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction);
          if (list.length > 0) {
            callbacks.onTransactions(list);
          }
        },
        (err) => handleListenerError('Transactions', err)
      )
    );

    // Withdrawals
    unsubs.push(
      onSnapshot(
        collection(db, WITHDRAWALS_COL),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WithdrawalRequest);
          if (list.length > 0) {
            callbacks.onWithdrawals(list);
          }
        },
        (err) => handleListenerError('Withdrawals', err)
      )
    );

    // Notifications
    unsubs.push(
      onSnapshot(
        collection(db, NOTIFICATIONS_COL),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification);
          if (list.length > 0) {
            callbacks.onNotifications(list);
          }
        },
        (err) => handleListenerError('Notifications', err)
      )
    );

    // Settings
    unsubs.push(
      onSnapshot(
        doc(db, SETTINGS_COL, 'platform'),
        (snap) => {
          if (snap.exists()) {
            callbacks.onSettings(snap.data() as PlatformSettings);
          }
        },
        (err) => handleListenerError('Settings', err)
      )
    );

    // Adjustments
    unsubs.push(
      onSnapshot(
        collection(db, ADJUSTMENTS_COL),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BalanceAdjustmentLog);
          if (list.length > 0) {
            callbacks.onAdjustments(list);
          }
        },
        (err) => handleListenerError('Adjustments', err)
      )
    );
  } catch (err) {
    console.warn('Failed to setup Firestore subscriptions (operating in offline local mode):', err);
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

// User Actions
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, user.id), cleanData(user), { merge: true });
  } catch (err) {
    logFirestoreOpError('save user', err);
  }
}

export async function updateUserInFirestore(userId: string, updates: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COL, userId), cleanData(updates));
  } catch (err) {
    logFirestoreOpError('update user', err);
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COL, userId));
  } catch (err) {
    logFirestoreOpError('delete user', err);
  }
}

export async function checkUserEmailExistsInFirestore(email: string): Promise<boolean> {
  try {
    const clean = email.trim().toLowerCase();
    const q = query(collection(db, USERS_COL), where('email', '==', clean));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.warn('Could not check email directly against Firestore query, falling back:', err);
    return false;
  }
}

export async function deduplicateUsersInFirestore(targetEmail?: string): Promise<{ deletedIds: string[]; keptId?: string }> {
  try {
    const snap = await getDocs(collection(db, USERS_COL));
    const deletedIds: string[] = [];
    const usersByEmail = new Map<string, Array<{ id: string; createdAt: string; totalEarned: number }>>();

    snap.forEach((docSnap) => {
      const data = docSnap.data() as User;
      const email = (data.email || '').trim().toLowerCase();
      if (!email) return;
      if (targetEmail && email !== targetEmail.trim().toLowerCase()) return;

      const list = usersByEmail.get(email) || [];
      list.push({
        id: docSnap.id,
        createdAt: data.createdAt || new Date(0).toISOString(),
        totalEarned: data.totalEarned || 0,
      });
      usersByEmail.set(email, list);
    });

    const batch = writeBatch(db);
    let keptId: string | undefined;

    for (const [_, userList] of usersByEmail.entries()) {
      if (userList.length > 1) {
        // Keep the one with highest activity/earnings or earliest createdAt
        userList.sort((a, b) => {
          if (b.totalEarned !== a.totalEarned) return b.totalEarned - a.totalEarned;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        keptId = userList[0].id;
        for (let i = 1; i < userList.length; i++) {
          const dupId = userList[i].id;
          batch.delete(doc(db, USERS_COL, dupId));
          deletedIds.push(dupId);
        }
      }
    }

    if (deletedIds.length > 0) {
      await batch.commit();
      console.log(`Deduplicated ${deletedIds.length} redundant user records from Firestore.`);
    }

    return { deletedIds, keptId };
  } catch (err) {
    logFirestoreOpError('deduplicate users', err);
    return { deletedIds: [] };
  }
}

// Campaign Actions
export async function saveCampaignToFirestore(campaign: Campaign): Promise<void> {
  try {
    await setDoc(doc(db, CAMPAIGNS_COL, campaign.id), cleanData(campaign), { merge: true });
  } catch (err) {
    logFirestoreOpError('save campaign', err);
  }
}

export async function updateCampaignInFirestore(campaignId: string, updates: Partial<Campaign>): Promise<void> {
  try {
    await updateDoc(doc(db, CAMPAIGNS_COL, campaignId), cleanData(updates));
  } catch (err) {
    logFirestoreOpError('update campaign', err);
  }
}

export async function deleteCampaignFromFirestore(campaignId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CAMPAIGNS_COL, campaignId));
  } catch (err) {
    logFirestoreOpError('delete campaign', err);
  }
}

// Brand Actions
export async function saveBrandToFirestore(brand: Brand): Promise<void> {
  try {
    await setDoc(doc(db, BRANDS_COL, brand.id), cleanData(brand), { merge: true });
  } catch (err) {
    logFirestoreOpError('save brand', err);
  }
}

export async function updateBrandInFirestore(brandId: string, updates: Partial<Brand>): Promise<void> {
  try {
    await updateDoc(doc(db, BRANDS_COL, brandId), cleanData(updates));
  } catch (err) {
    logFirestoreOpError('update brand', err);
  }
}

export async function deleteBrandFromFirestore(brandId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BRANDS_COL, brandId));
  } catch (err) {
    logFirestoreOpError('delete brand', err);
  }
}

// Survey Feedback Response Submission
export async function saveFeedbackResponseToFirestore(
  response: UserResponse,
  transaction: Transaction,
  notification: AppNotification,
  updatedUser: User,
  updatedCampaign: Campaign
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, RESPONSES_COL, response.id), cleanData(response));
    batch.set(doc(db, TRANSACTIONS_COL, transaction.id), cleanData(transaction));
    batch.set(doc(db, NOTIFICATIONS_COL, notification.id), cleanData(notification));
    batch.set(doc(db, USERS_COL, updatedUser.id), cleanData(updatedUser), { merge: true });
    batch.set(doc(db, CAMPAIGNS_COL, updatedCampaign.id), cleanData(updatedCampaign), { merge: true });
    await batch.commit();
  } catch (err) {
    logFirestoreOpError('save feedback response batch', err);
  }
}

// Toggle response visibility
export async function toggleResponseVisibilityInFirestore(responseId: string, isHidden: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, RESPONSES_COL, responseId), { isHidden });
  } catch (err) {
    logFirestoreOpError('toggle response visibility', err);
  }
}

// Transaction Actions
export async function saveTransactionToFirestore(transaction: Transaction): Promise<void> {
  try {
    await setDoc(doc(db, TRANSACTIONS_COL, transaction.id), cleanData(transaction));
  } catch (err) {
    logFirestoreOpError('save transaction', err);
  }
}

// Withdrawal Actions
export async function saveWithdrawalToFirestore(
  withdrawal: WithdrawalRequest,
  transaction: Transaction,
  notification: AppNotification,
  updatedUser: User
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, WITHDRAWALS_COL, withdrawal.id), cleanData(withdrawal));
    batch.set(doc(db, TRANSACTIONS_COL, transaction.id), cleanData(transaction));
    batch.set(doc(db, NOTIFICATIONS_COL, notification.id), cleanData(notification));
    batch.set(doc(db, USERS_COL, updatedUser.id), cleanData(updatedUser), { merge: true });
    await batch.commit();
  } catch (err) {
    logFirestoreOpError('save withdrawal batch', err);
  }
}

export async function updateWithdrawalStatusInFirestore(
  withdrawalId: string,
  status: string,
  adminNote?: string,
  refundInfo?: { user: User; refundNotif: AppNotification }
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const wdRef = doc(db, WITHDRAWALS_COL, withdrawalId);
    batch.update(wdRef, {
      status,
      adminNote: adminNote || '',
      processedAt: new Date().toISOString(),
    });

    if (refundInfo) {
      batch.set(doc(db, USERS_COL, refundInfo.user.id), cleanData(refundInfo.user), { merge: true });
      batch.set(doc(db, NOTIFICATIONS_COL, refundInfo.refundNotif.id), cleanData(refundInfo.refundNotif));
    }

    await batch.commit();
  } catch (err) {
    logFirestoreOpError('update withdrawal status', err);
  }
}

// Notification Actions
export async function saveNotificationToFirestore(notif: AppNotification): Promise<void> {
  try {
    await setDoc(doc(db, NOTIFICATIONS_COL, notif.id), cleanData(notif));
  } catch (err) {
    logFirestoreOpError('save notification', err);
  }
}

export async function markNotificationReadInFirestore(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COL, notifId), { read: true });
  } catch (err) {
    logFirestoreOpError('mark notification read', err);
  }
}

// Settings Actions
export async function updateSettingsInFirestore(settings: PlatformSettings): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'platform'), cleanData(settings), { merge: true });
  } catch (err) {
    logFirestoreOpError('update settings', err);
  }
}

// Balance Adjustment Action
export async function saveBalanceAdjustmentToFirestore(
  log: BalanceAdjustmentLog,
  transaction: Transaction,
  notification: AppNotification,
  updatedUser: User
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, ADJUSTMENTS_COL, log.id), cleanData(log));
    batch.set(doc(db, TRANSACTIONS_COL, transaction.id), cleanData(transaction));
    batch.set(doc(db, NOTIFICATIONS_COL, notification.id), cleanData(notification));
    batch.set(doc(db, USERS_COL, updatedUser.id), cleanData(updatedUser), { merge: true });
    await batch.commit();
  } catch (err) {
    logFirestoreOpError('save balance adjustment', err);
  }
}

// Brand Inquiries Operations
export function listenToBrandInquiries(callback: (inquiries: BrandInquiry[]) => void): Unsubscribe {
  const colRef = collection(db, BRAND_INQUIRIES_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: BrandInquiry[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<BrandInquiry, 'id'>) });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      callback(list);
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || err?.code === 'unavailable') {
        console.warn('Firestore brand_inquiries offline/quota notice (operating in local offline mode):', err?.message || err);
      } else {
        console.warn('Firestore brand_inquiries listener error:', err);
      }
    }
  );
}

export async function saveBrandInquiryToFirestore(inquiry: BrandInquiry): Promise<void> {
  try {
    await setDoc(doc(db, BRAND_INQUIRIES_COL, inquiry.id), cleanData(inquiry));
  } catch (err) {
    logFirestoreOpError('save brand inquiry', err);
  }
}

export async function updateBrandInquiryStatusInFirestore(
  inquiryId: string,
  status: InquiryStatus,
  adminNotes?: string,
  campaignCreatedId?: string
): Promise<void> {
  try {
    const updatePayload: Record<string, any> = { status };
    if (adminNotes !== undefined) updatePayload.adminNotes = adminNotes;
    if (campaignCreatedId !== undefined) updatePayload.campaignCreatedId = campaignCreatedId;
    await updateDoc(doc(db, BRAND_INQUIRIES_COL, inquiryId), updatePayload);
  } catch (err) {
    logFirestoreOpError('update brand inquiry', err);
  }
}

export function listenToEmailCampaigns(callback: (campaigns: EmailCampaign[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, EMAIL_CAMPAIGNS_COL),
    (snapshot) => {
      const campaigns: EmailCampaign[] = [];
      snapshot.forEach((docSnap) => {
        campaigns.push(docSnap.data() as EmailCampaign);
      });
      // Sort newest first
      campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(campaigns);
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || err?.code === 'unavailable') {
        console.warn('Firestore email_campaigns offline/quota notice (operating in local offline mode):', err?.message || err);
      } else {
        console.warn('listenToEmailCampaigns notice (using fallback):', err);
      }
    }
  );
}

export async function saveEmailCampaignToFirestore(campaign: EmailCampaign): Promise<void> {
  try {
    await setDoc(doc(db, EMAIL_CAMPAIGNS_COL, campaign.id), cleanData(campaign));
  } catch (err) {
    logFirestoreOpError('save email campaign', err);
  }
}

export async function deleteEmailCampaignFromFirestore(campaignId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EMAIL_CAMPAIGNS_COL, campaignId));
  } catch (err) {
    logFirestoreOpError('delete email campaign', err);
  }
}

export function listenToNewsletterSubscribers(callback: (subscribers: NewsletterSubscriber[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, NEWSLETTER_SUBSCRIBERS_COL),
    (snapshot) => {
      const subscribers: NewsletterSubscriber[] = [];
      snapshot.forEach((docSnap) => {
        subscribers.push(docSnap.data() as NewsletterSubscriber);
      });
      subscribers.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
      callback(subscribers);
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || err?.code === 'unavailable') {
        console.warn('Firestore newsletter_subscribers offline/quota notice (operating in local offline mode):', err?.message || err);
      } else {
        console.warn('listenToNewsletterSubscribers notice (using fallback):', err);
      }
    }
  );
}

export async function saveNewsletterSubscriberToFirestore(subscriber: NewsletterSubscriber): Promise<void> {
  try {
    await setDoc(doc(db, NEWSLETTER_SUBSCRIBERS_COL, subscriber.id), cleanData(subscriber));
  } catch (err) {
    logFirestoreOpError('save newsletter subscriber', err);
  }
}

export async function deleteNewsletterSubscriberFromFirestore(subscriberId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, NEWSLETTER_SUBSCRIBERS_COL, subscriberId));
  } catch (err) {
    logFirestoreOpError('delete newsletter subscriber', err);
  }
}

export async function syncAllCustomersAsNewsletterSubscribersToFirestore(
  subscribers: NewsletterSubscriber[],
  updatedUsers?: User[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const sub of subscribers) {
      batch.set(doc(db, NEWSLETTER_SUBSCRIBERS_COL, sub.id), cleanData(sub), { merge: true });
    }
    if (updatedUsers && updatedUsers.length > 0) {
      for (const u of updatedUsers) {
        batch.set(doc(db, USERS_COL, u.id), cleanData(u), { merge: true });
      }
    }
    await batch.commit();
    console.log(`Successfully synced ${subscribers.length} customer newsletter subscribers to Firestore.`);
  } catch (err) {
    console.warn('Failed to sync customer newsletter subscribers to Firestore:', err);
  }
}

// ---------------------------------------------------------------------------
// BRAND RESEARCH STUDIES CMS (collection: 'research_articles')
// ---------------------------------------------------------------------------

export function listenToResearchArticles(callback: (articles: ResearchArticle[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, RESEARCH_ARTICLES_COL),
    (snapshot) => {
      const articles: ResearchArticle[] = [];
      snapshot.forEach((docSnap) => {
        articles.push({ id: docSnap.id, ...(docSnap.data() as Omit<ResearchArticle, 'id'>) });
      });
      // Sort by published_at or created_at descending
      articles.sort((a, b) => {
        const timeA = new Date(a.published_at || a.created_at).getTime();
        const timeB = new Date(b.published_at || b.created_at).getTime();
        return timeB - timeA;
      });
      callback(articles);
    },
    (err) => {
      if (err?.code === 'resource-exhausted' || err?.code === 'unavailable') {
        console.warn('Firestore research_articles offline/quota notice (operating in local fallback):', err?.message || err);
      } else {
        console.warn('listenToResearchArticles notice (using fallback):', err);
      }
    }
  );
}

export async function saveResearchArticleToFirestore(article: ResearchArticle): Promise<void> {
  try {
    await setDoc(doc(db, RESEARCH_ARTICLES_COL, article.id), cleanData(article), { merge: true });
  } catch (err) {
    logFirestoreOpError('save research article', err);
  }
}

export async function deleteResearchArticleFromFirestore(articleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RESEARCH_ARTICLES_COL, articleId));
  } catch (err) {
    logFirestoreOpError('delete research article', err);
  }
}

export async function syncAllResearchArticlesToFirestore(articles: ResearchArticle[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const art of articles) {
      batch.set(doc(db, RESEARCH_ARTICLES_COL, art.id), cleanData(art), { merge: true });
    }
    await batch.commit();
    console.log(`Successfully synced ${articles.length} brand research studies to Firestore.`);
  } catch (err) {
    console.warn('Failed to sync brand research studies to Firestore:', err);
  }
}


