interface FlashProps {
  success?: string | null;
  error?: string | null;
  info?: string | null;
}
export default function Flash({ success, error, info }: FlashProps) {
  return (
    <>
      {success && <div className="alert alert-success alert-dismissible fade show"><i className="bi bi-check-circle me-2"></i>{success}<button type="button" className="btn-close" data-bs-dismiss="alert"></button></div>}
      {error   && <div className="alert alert-danger alert-dismissible fade show"><i className="bi bi-exclamation-triangle me-2"></i>{error}<button type="button" className="btn-close" data-bs-dismiss="alert"></button></div>}
      {info    && <div className="alert alert-info alert-dismissible fade show"><i className="bi bi-info-circle me-2"></i>{info}<button type="button" className="btn-close" data-bs-dismiss="alert"></button></div>}
    </>
  );
}
