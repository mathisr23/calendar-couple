import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';

import { Layout } from './components/Layout';
import { Calendar } from './components/Calendar';
import { Header } from './components/Header';
import { MonthlyEvents } from './components/MonthlyEvents';
import { DateIdeas } from './components/DateIdeas';
import { AddDateAction } from './components/AddDateAction';
import { Addresses } from './components/Addresses';
import { Activities } from './components/Activities';
import type { PlannedDate, BucketIdea, Address, AddressCategory, ActivityIdea } from './types';

function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();

  // Local state for UI
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activePage, setActivePage] = useState<'calendar' | 'addresses' | 'activities'>('calendar');

  // Data state
  const [plannedDates, setPlannedDates] = useState<PlannedDate[]>([]);
  const [bucketList, setBucketList] = useState<BucketIdea[]>([]);
  const [activities, setActivities] = useState<ActivityIdea[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Couple Data
  const [partnerProfile, setPartnerProfile] = useState<{ full_name: string } | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Computed Current User ID (for permissions/filtering if needed)
  const currentUserId = user?.id || '';

  useEffect(() => {
    if (profile?.couple_id) {
      fetchCoupleData();

      // Realtime subscription
      const channel = supabase
        .channel('couple_changes')
        .on('postgres_changes', { event: '*', schema: 'public', filter: `couple_id=eq.${profile.couple_id}` }, () => {
          fetchCoupleData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [profile?.couple_id]);

  const fetchCoupleData = async () => {
    if (!profile?.couple_id) return;
    try {
      // Parallel fetching
      const [datesRes, bucketRes, addressesRes, activitiesRes, profilesRes, coupleRes] = await Promise.all([
        supabase.from('planned_dates').select('*').eq('couple_id', profile.couple_id),
        supabase.from('bucket_list_items').select('*').eq('couple_id', profile.couple_id).order('created_at'),
        supabase.from('addresses').select('*').eq('couple_id', profile.couple_id),
        supabase.from('activities').select('*').eq('couple_id', profile.couple_id),
        supabase.from('profiles').select('id, full_name').eq('couple_id', profile.couple_id).neq('id', currentUserId).single(),
        supabase.from('couples').select('invite_code').eq('id', profile.couple_id).single(),
      ]);

      if (datesRes.data) {
        setPlannedDates(datesRes.data.map(d => ({
          ...d,
          date: new Date(d.date),
          endDate: d.end_date ? new Date(d.end_date) : undefined,
          authorId: d.author_id // Map snake_case to camelCase
        })));
      }
      if (bucketRes.data) setBucketList(bucketRes.data);
      if (addressesRes.data) setAddresses(addressesRes.data);
      if (activitiesRes.data) {
        setActivities(activitiesRes.data.map((a: any) => ({
          ...a,
          authorId: a.author_id // Map snake_case to camelCase
        })));
      }
      if (profilesRes.data) {
        setPartnerProfile(profilesRes.data);
      } else {
        setPartnerProfile(null);
      }
      if (coupleRes.data) setInviteCode(coupleRes.data.invite_code);

    } catch (e) {
      console.error(e);
    }
  };

  // --- Actions ---

  const addPlannedDate = async (category: PlannedDate['category'], title: string, date: Date, endDate?: Date, color?: string, customCategoryName?: string) => {
    if (!profile?.couple_id) return;

    // Optimistic update
    const tempId = Date.now().toString();
    const newDate: PlannedDate = {
      id: tempId, category, title, date, endDate, color, customCategoryName, authorId: currentUserId
    };
    setPlannedDates([...plannedDates, newDate]);

    await supabase.from('planned_dates').insert({
      couple_id: profile.couple_id,
      category, title, date: date.toISOString(), end_date: endDate?.toISOString(), color, custom_category_name: customCategoryName, author_id: currentUserId
    });
  };

  const deletePlannedDate = async (id: string) => {
    setPlannedDates(plannedDates.filter(pd => pd.id !== id));
    await supabase.from('planned_dates').delete().eq('id', id);
  };

  const addAddress = async (name: string, category: AddressCategory) => {
    if (!profile?.couple_id) return;
    const tempId = Date.now().toString();
    setAddresses([...addresses, { id: tempId, name, category, rating1: null, rating2: null, completed: false }]);

    await supabase.from('addresses').insert({
      couple_id: profile.couple_id,
      name, category
    });
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    setAddresses(addresses.map(a => a.id === id ? { ...a, ...updates } : a));
    await supabase.from('addresses').update(updates).eq('id', id);
  };

  const deleteAddress = async (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
    await supabase.from('addresses').delete().eq('id', id);
  };

  const addActivity = async (title: string, budget: import('./types').Budget) => {
    if (!profile?.couple_id) return;
    const tempId = Date.now().toString();
    setActivities([...activities, { id: tempId, title, budget, authorId: currentUserId }]);

    await supabase.from('activities').insert({
      couple_id: profile.couple_id,
      title, budget, author_id: currentUserId
    });
  };

  const deleteActivity = async (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    await supabase.from('activities').delete().eq('id', id);
  };

  const addBucketItem = async (text: string) => {
    if (!profile?.couple_id) return;
    const tempId = Date.now().toString();
    const newItem: BucketIdea = { id: tempId, text, completed: false };
    setBucketList([...bucketList, newItem]);

    const { data } = await supabase.from('bucket_list_items').insert({
      couple_id: profile.couple_id,
      text,
      completed: false
    }).select().single();

    if (data) {
      // Update with real ID
      setBucketList(prev => prev.map(item => item.id === tempId ? { ...item, id: data.id } : item));
    }
  };

  const deleteBucketItem = async (id: string) => {
    setBucketList(bucketList.filter(i => i.id !== id));
    await supabase.from('bucket_list_items').delete().eq('id', id);
  };

  const toggleBucketItem = async (id: string, completed: boolean) => {
    setBucketList(bucketList.map(i => i.id === id ? { ...i, completed } : i));
    await supabase.from('bucket_list_items').update({ completed }).eq('id', id);
  };




  // --- Render Logic ---

  // --- Render Logic ---

  if (authLoading) return <div className="loading-screen">INITIALISATION POTATO OS...</div>;
  if (!user) return <LoginPage />;
  if (!profile?.couple_id) return <OnboardingPage />;

  return (
    <Layout>
      <Header inviteCode={inviteCode} />

      <main className="container main-content">
        <div className="retro-tabs">
          <button
            className={`retro-tab ${activePage === 'calendar' ? 'active' : ''}`}
            onClick={() => setActivePage('calendar')}
          >
            CALENDRIER.EXE
          </button>
          <button
            className={`retro-tab ${activePage === 'addresses' ? 'active' : ''}`}
            onClick={() => setActivePage('addresses')}
          >
            ADRESSES.TXT
          </button>
          <button
            className={`retro-tab ${activePage === 'activities' ? 'active' : ''}`}
            onClick={() => setActivePage('activities')}
          >
            ACTIVITES.BAT
          </button>
        </div>

        <div className="retro-window-content retro-card">
          {activePage === 'calendar' ? (
            <>
              <div className="calendar-section">
                <Calendar
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  plannedDates={plannedDates}
                />
              </div>

              <div className="bottom-grid">
                <MonthlyEvents
                  currentMonth={currentMonth}
                  plannedDates={plannedDates}
                  onAdd={addPlannedDate}
                  onDelete={deletePlannedDate}
                />
                <DateIdeas
                  ideas={bucketList}
                  onAdd={addBucketItem}
                  onDelete={deleteBucketItem}
                  onToggle={toggleBucketItem}
                />
                <div className="full-width-column">
                  <AddDateAction
                    selectedDate={selectedDate}
                    onAdd={addPlannedDate}
                  />
                </div>
              </div>
            </>
          ) : activePage === 'activities' ? (
            <Activities
              activities={activities}
              onAdd={addActivity}
              onDelete={deleteActivity}
              currentUserId={currentUserId}
              partnerName={partnerProfile?.full_name || 'En attente...'}
              userName={profile?.full_name || 'Moi'}
            />
          ) : (
            <Addresses
              addresses={addresses}
              currentUser={currentUserId}
              onAdd={addAddress}
              onUpdate={updateAddress}
              onDelete={deleteAddress}
              partnerName={partnerProfile?.full_name || 'Partenaire'}
              userName={profile?.full_name || 'Moi'}
            />
          )}
        </div>
      </main>

      <style>{`
        .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--retro-bg);
            color: var(--retro-dark);
            font-family: var(--font-display);
            font-size: 2rem;
        }
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-bottom: 5rem;
          min-height: 70vh;
        }
        
        /* TABS */
        .retro-tabs {
          display: flex;
          gap: 8px;
          padding-left: 12px;
          margin-bottom: -2px;
          z-index: 10;
          overflow-x: auto; /* Scrollable tabs */
          -webkit-overflow-scrolling: touch;
          white-space: nowrap;
          padding-bottom: 0; /* Removing padding that might hide scrollbar if we hide it elsewhere */
          /* Hide scrollbar */
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }
        .retro-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .retro-tab {
          background: #FFF;
          border: var(--retro-border);
          border-bottom: none;
          padding: 8px 24px;
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--text-muted);
          position: relative;
          top: 0;
          transition: top 0.2s;
          border-radius: 4px 4px 0 0;
          flex-shrink: 0; /* Prevent shrinking */
        }
        
        .retro-tab.active {
          background: var(--retro-yellow); 
          color: var(--retro-dark);
          z-index: 12;
          padding-bottom: 10px;
          box-shadow: 0 -4px 0 rgba(0,0,0,0.1);
        }

        .retro-tab:hover:not(.active) {
            top: -4px;
        }

        /* WINDOW CONTENT */
        .retro-window-content {
          border: var(--retro-border);
          background: #FFF;
          padding: 2rem;
          position: relative;
          z-index: 1;
          border-radius: 4px;
        }
        
        /* Tweaks to internal layout */
        .calendar-section {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-bottom: 2rem;
        }
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        .full-width-column {
          grid-column: 1 / span 2;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        @media (max-width: 1024px) {
          .bottom-grid {
            grid-template-columns: 1fr; /* Force single column */
            gap: 1.5rem;
          }
          .full-width-column {
            grid-column: 1;
          }
          .retro-window-content {
            padding: 1rem; /* Reduce padding */
          }
          .retro-tab {
             font-size: 1rem;
             padding: 8px 16px;
          }
        }
      `}</style>
    </Layout>
  );
}

// Wrapper for Context
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
