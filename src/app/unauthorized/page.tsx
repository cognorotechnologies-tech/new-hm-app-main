export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-red-50">
            <h1 className="text-4xl font-bold text-red-600">401 - Unauthorized</h1>
            <p className="mt-4 text-lg">You do not have permission to access this page.</p>
        </div>
    );
}
