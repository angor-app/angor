import { useSeoMeta } from '@unhead/react';
import { Dashboard } from '@/components/angor/Dashboard';

const Index = () => {
  useSeoMeta({
    title: 'Angor - Decentralized Bitcoin Funding Protocol',
    description: 'A fully decentralized Bitcoin funding protocol with time-locked fund release, built on Bitcoin Taproot and Nostr.',
  });

  return <Dashboard />;
};

export default Index;
