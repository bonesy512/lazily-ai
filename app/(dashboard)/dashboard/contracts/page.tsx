'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText } from "lucide-react";

export default function ContractsPage() {

  // We will add the logic for handling the file upload later.
  // For now, this is the UI scaffolding.
  const handleFileUpload = () => {
    alert("File upload functionality will be implemented here!");
  };

  return (
    <section>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        Bulk Contract Generation
      </h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Your Property List</CardTitle>
          <CardDescription>
            Upload a CSV file with your property and owner data. A TREC 1-4 form will be generated for each row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">CSV File</Label>
              <div className="flex items-center gap-4">
                <Input id="csv-upload" type="file" accept=".csv" className="max-w-xs" />
                <Button onClick={handleFileUpload}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload and Process
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required columns: [StreetAddress], [City], [ZipCode], [OwnerName], [OfferPrice]...
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Contracts</CardTitle>
          <CardDescription>
            Your generated TREC forms will appear here after processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* This is a placeholder for where the results will be displayed */}
          <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-border rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No files processed yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Upload a CSV file to begin generating your contracts.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}