export default function AppStoreButtons({
  appStoreUrl = 'https://apps.apple.com/app/idYOUR_APP_ID',
  playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kbbmedic.recover',
  className = '',
}) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {/* App Store */}
      <a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download on the App Store"
        className="inline-block transition hover:opacity-85"
      >
        <img
          src="/images/app-store-badge.svg"
          alt="Download on the App Store"
          className="h-12 w-auto"
        />
      </a>

      {/* Google Play */}
      <a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get it on Google Play"
        className="inline-block transition hover:opacity-85"
      >
        <img
          src="/images/google-play-badge.png"
          alt="Get it on Google Play"
          className="h-12 w-auto"
        />
      </a>
    </div>
  );
}