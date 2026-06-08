"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileSpreadsheet,
  Globe,
  Loader2,
  Table as TableIcon,
  Upload,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function UploadPage() {
  const router = useRouter()

  const [step, setStep] = React.useState(1)
  const [file, setFile] = React.useState<File | null>(null)
  const [sheetUrl, setSheetUrl] = React.useState("")
  const [fileTypeDetected, setFileTypeDetected] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [analysisResult, setAnalysisResult] = React.useState<any>(null)
  const [importMethod, setImportMethod] = React.useState<"file" | "google-sheets">("file")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setSaveError(null)

    if (!selectedFile) {
      setFile(null)
      setFileTypeDetected(null)
      return
    }

    const fileName = selectedFile.name.toLowerCase()
    if (fileName.endsWith('.csv') || selectedFile.type === 'text/csv') {
      setFileTypeDetected('CSV')
      setFile(selectedFile)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFileTypeDetected('Excel')
      setFile(selectedFile)
    } else {
      setFile(null)
      setFileTypeDetected(null)
      setSaveError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.")
    }
  }

  const handleUpload = async () => {
    if (importMethod === "file" && !file) return
    if (importMethod === "google-sheets" && !sheetUrl) return

    setIsUploading(true)
    setProgress(0)
    setSaveError(null)

    // Simulate progress for UI
    let p = 0
    const timer = setInterval(() => {
      p += 15
      setProgress(Math.min(p, 90))
    }, 150)

    try {
      const formData = new FormData()
      
      if (importMethod === "file") {
        formData.append('file', file!)
        formData.append('source', fileTypeDetected === 'CSV' ? 'csv' : 'excel')
      } else {
        formData.append('sheetUrl', sheetUrl)
        formData.append('source', 'google-sheets')
      }

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json()

      clearInterval(timer)
      setProgress(100)

      if (!response.ok || !payload.ok) {
        setSaveError(payload.error ?? "Failed to save upload analysis")
        setIsUploading(false)
        return
      }

      setAnalysisResult(payload)
      setStep(3)
    } catch (error) {
      clearInterval(timer)
      setSaveError("Unexpected network error while saving upload results.")
    } finally {
      setIsUploading(false)
    }
  }

  const resetFlow = () => {
    setStep(1)
    setFile(null)
    setFileTypeDetected(null)
    setSheetUrl("")
    setProgress(0)
    setSaveError(null)
    setAnalysisResult(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Business Data</h1>
        <p className="mt-2 text-muted-foreground">
          Upload an Excel, CSV, or Google Sheet file. We parse, validate, and save your results.
        </p>

        <div className="mt-8 flex items-center gap-4">
          {[1, 2, 3].map((num, idx) => (
            <React.Fragment key={num}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step >= num ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-500"
                }`}
              >
                {num}
              </div>
              {idx < 2 && (
                <div className={`h-1 flex-1 rounded-full ${step >= num + 1 ? "bg-primary" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {step <= 2 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Parsing your file...</p>
                <div className="mx-auto max-w-xs">
                  <Progress value={progress} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{progress}% completed</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Import Data</h3>
                  <p className="mt-1 text-muted-foreground">Supports .csv, .xlsx, .xls and Google Sheets</p>
                </div>
                
                <Tabs defaultValue="file" className="w-full max-w-md mx-auto" onValueChange={(val) => setImportMethod(val as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                    <TabsTrigger value="google-sheets">Google Sheets</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="pt-4">
                    <div className="mx-auto pt-4 pb-2">
                      <input 
                        type="file" 
                        accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" 
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20 cursor-pointer"
                      />
                    </div>

                    {fileTypeDetected && (
                      <Badge variant="outline" className="mb-4 bg-green-50 text-green-700 border-green-200">
                        Detected: {fileTypeDetected} file ({file?.name})
                      </Badge>
                    )}
                    
                    <Button onClick={handleUpload} disabled={!file || !!saveError} className="mt-4 w-full">
                      Upload & Parse File
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="google-sheets" className="pt-4 space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="sheetUrl">Google Sheet URL</Label>
                      <Input 
                        id="sheetUrl" 
                        placeholder="https://docs.google.com/spreadsheets/d/..." 
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your sheet must be published: File → Share → Publish to web → CSV
                      </p>
                    </div>
                    
                    <Button onClick={handleUpload} disabled={!sheetUrl} className="mt-4 w-full">
                      Import from Google Sheets
                    </Button>
                  </TabsContent>
                </Tabs>

                {saveError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mx-auto max-w-md mt-4">
                    {saveError}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Field Mapping & Quality Check</CardTitle>
            <CardDescription>
              {analysisResult.totalRows || 0} rows detected • {analysisResult.summary.errors} errors, {analysisResult.summary.warnings} warnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50/50 p-4 text-sm">
              <p className="font-medium">Validation preview</p>
              <p className="mt-1 text-muted-foreground">
                Data quality score {analysisResult.summary.dataQualityScore}/100
                <br/>
                Overall health score {analysisResult.summary.healthScore}/100
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={resetFlow} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Start Over
            </Button>
            <Button onClick={() => router.push(`/data-validation?uploadId=${analysisResult.uploadId}`)} className="gap-2">
              Review Validation <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
