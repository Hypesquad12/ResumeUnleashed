import Script from 'next/script'

export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = 'G-VZBXDRC0QS'
  const ADS_CONVERSION_ID = 'AW-16646030071'

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
          gtag('config', '${ADS_CONVERSION_ID}');
        `}
      </Script>
    </>
  )
}
