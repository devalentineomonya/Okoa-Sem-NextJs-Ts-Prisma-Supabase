import { UploadForm } from "@/components/upload-form"

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Upload Resource</h1>
      <p className="text-muted-foreground mb-8">Share academic resources with other students</p>

      <UploadForm />
    </div>
  )
}
