export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <img
          src="/images/justlighthouse.svg"
          alt=""
          className="h-16 w-16 mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold text-stone-800 mb-4">
          Access Denied
        </h1>
        <p className="text-stone-600 mb-6">
          Your email domain is not authorized to use TCLC PBL Tools. This tool
          is available to staff at partner organizations.
        </p>
        <a
          href="/auth/logout"
          className="inline-block bg-brand-800 hover:bg-brand-900 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </a>
      </div>
    </div>
  );
}
