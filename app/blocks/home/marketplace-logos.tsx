import React from 'react';
import { IconBrandAmazon, IconBrandFacebook } from '@tabler/icons-react';

export const LogoEbay = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="32" letterSpacing="-0.05em">ebay</text>
  </svg>
);

export const LogoShopify = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 140 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="28" letterSpacing="-0.03em">shopify</text>
  </svg>
);

export const LogoStockX = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 140 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="30" letterSpacing="-0.02em" fontStyle="italic">StockX</text>
  </svg>
);

export const LogoGoat = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="28" letterSpacing="0.05em">GOAT</text>
  </svg>
);

export const LogoMercari = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 140 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="28" letterSpacing="-0.03em">mercari</text>
  </svg>
);

export const LogoPoshmark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 180 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="'Times New Roman', Times, serif" fontWeight="700" fontSize="32" letterSpacing="0.02em">poshmark</text>
  </svg>
);

export const LogoDepop = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="32" letterSpacing="-0.06em">depop</text>
  </svg>
);

export const LogoGrailed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="28" letterSpacing="0.04em">GRAILED</text>
  </svg>
);

export const LogoOfferUp = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 40" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="28" letterSpacing="-0.02em">OfferUp</text>
  </svg>
);

export const MARKETPLACE_LOGOS = [
  { name: "Amazon", Component: ({ className }: { className?: string }) => <IconBrandAmazon className={className} /> },
  { name: "Mercari", Component: LogoMercari },
  { name: "StockX", Component: LogoStockX },
  { name: "GOAT", Component: LogoGoat },
  { name: "Poshmark", Component: LogoPoshmark },
  { name: "Depop", Component: LogoDepop },
  { name: "Facebook", Component: ({ className }: { className?: string }) => <IconBrandFacebook className={className} /> },
  { name: "Grailed", Component: LogoGrailed },
  { name: "Shopify", Component: LogoShopify },
  { name: "OfferUp", Component: LogoOfferUp },
  { name: "eBay", Component: LogoEbay },
];
