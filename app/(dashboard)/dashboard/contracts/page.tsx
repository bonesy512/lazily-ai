import { CsvUploadForm } from '@/components/dashboard/CsvUploadForm';
import { PropertyList } from '@/components/dashboard/PropertyList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditsCounter } from "@/components/dashboard/CreditsCounter";

export default async function ContractsPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <CreditsCounter />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Property List</CardTitle>
          <CardDescription>
            Upload a CSV file with your property and owner data. A TREC 1-4 form will be generated for each row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CsvUploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Contracts</CardTitle>
          <CardDescription>
            Properties you've uploaded will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <PropertyList />
        </CardContent>
      </Card>
    </section>
  );
}
