export const metadata = {
  title: 'Payment Successful',
  description: 'Your payment was received. Credits will be available shortly.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/success' },
};

export default function SuccessLayout({ children }) {
  return children;
}
