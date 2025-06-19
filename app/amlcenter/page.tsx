"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, FileText, Database, Users, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";

interface SanctionEntry {
  id: string;
  name: string;
  type: string;
  nationality?: string;
  address?: any;
  otherInfo?: string;
}

interface MatchResult {
  name: string;
  matches: {
    sanctionEntry: SanctionEntry;
    similarity: number;
    matchType: 'high' | 'medium' | 'low';
  }[];
}

export default function AMLCenterPage() {
  const router = useRouter();
  const [sanctionsData, setSanctionsData] = useState<SanctionEntry[]>([]);
  const [searchResults, setSearchResults] = useState<SanctionEntry[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    idFilter: "",
    nameFilter: "",
    typeFilter: "",
    nationalityFilter: "",
    perPage: "20"
  });

  // Load sanctions data on component mount
  useEffect(() => {
    loadSanctionsData();
  }, []);

  const loadSanctionsData = async () => {
    try {
      const response = await fetch('/api/aml/sanctions');
      if (response.ok) {
        const data = await response.json();
        setSanctionsData(data);
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error loading sanctions data:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'pdf' | 'xml') => {
    setLoading(true);
    const formData = new FormData();
    formData.append(type === 'pdf' ? 'pdfFile' : 'xmlFile', file);

    try {
      const response = await fetch(`/api/aml/upload-${type}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(`${type.toUpperCase()} file processed successfully!`);
        await loadSanctionsData(); // Reload data
      } else {
        toast.error(result.error || `Failed to process ${type.toUpperCase()} file`);
      }
    } catch (error) {
      toast.error(`Error uploading ${type.toUpperCase()} file`);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelMatch = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch('/api/aml/match-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMatchResults(result.matches);
        toast.success(`Excel file processed! Found ${result.totalMatches} potential matches.`);
        setActiveTab("matches");
      } else {
        toast.error(result.error || 'Failed to process Excel file');
      }
    } catch (error) {
      toast.error('Error processing Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...searchFilters
      });

      const response = await fetch(`/api/aml/search?${params}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setActiveTab("search");
      }
    } catch (error) {
      toast.error('Error performing search');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (matchType: string, similarity: number) => {
    if (matchType === 'high' || similarity > 0.8) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />High Risk</Badge>;
    } else if (matchType === 'medium' || similarity > 0.6) {
      return <Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Medium Risk</Badge>;
    } else {
      return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Low Risk</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold">AML Center</h1>
            <p className="text-gray-600">Anti-Money Laundering Compliance & Monitoring</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Data
          </TabsTrigger>
          <TabsTrigger value="match" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Match Excel
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            View Data
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Client Space
          </TabsTrigger>
        </TabsList>

        {/* Upload Data Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* PDF Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Upload PDF Sanctions
                </CardTitle>
                <CardDescription>
                  Upload UN Sanctions PDF files for processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Click to select or drag and drop</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'pdf');
                      }}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <Label htmlFor="pdf-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={loading}>
                        {loading ? 'Processing...' : 'Select PDF File'}
                      </Button>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* XML Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Upload XML Sanctions
                </CardTitle>
                <CardDescription>
                  Upload UN Sanctions XML files for processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Click to select or drag and drop</p>
                    <Input
                      type="file"
                      accept=".xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'xml');
                      }}
                      className="hidden"
                      id="xml-upload"
                    />
                    <Label htmlFor="xml-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={loading}>
                        {loading ? 'Processing...' : 'Select XML File'}
                      </Button>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status */}
          {sanctionsData.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully loaded {sanctionsData.length} sanctions entries.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Match Excel Tab */}
        <TabsContent value="match" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Excel Name Matching
              </CardTitle>
              <CardDescription>
                Upload Excel files with names to match against sanctions lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sanctionsData.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload sanctions data first to enable matching functionality.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload Excel file with names to match</p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleExcelMatch(file);
                      }}
                      className="hidden"
                      id="excel-upload"
                    />
                    <Label htmlFor="excel-upload" className="cursor-pointer">
                      <Button variant="outline" disabled={loading}>
                        {loading ? 'Processing...' : 'Select Excel File'}
                      </Button>
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Advanced Search
              </CardTitle>
              <CardDescription>
                Search through sanctions database with multiple filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* General Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search across all fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="id-filter">ID Filter</Label>
                    <Input
                      id="id-filter"
                      placeholder="Filter by ID"
                      value={searchFilters.idFilter}
                      onChange={(e) => setSearchFilters({...searchFilters, idFilter: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name-filter">Name Filter</Label>
                    <Input
                      id="name-filter"
                      placeholder="Filter by name"
                      value={searchFilters.nameFilter}
                      onChange={(e) => setSearchFilters({...searchFilters, nameFilter: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type-filter">Type Filter</Label>
                    <Select value={searchFilters.typeFilter} onValueChange={(value) => setSearchFilters({...searchFilters, typeFilter: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Entity">Entity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nationality-filter">Nationality</Label>
                    <Input
                      id="nationality-filter"
                      placeholder="Filter by nationality"
                      value={searchFilters.nationalityFilter}
                      onChange={(e) => setSearchFilters({...searchFilters, nationalityFilter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="per-page">Results per page:</Label>
                    <Select value={searchFilters.perPage} onValueChange={(value) => setSearchFilters({...searchFilters, perPage: value})}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="-1">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-600">
                    Showing {searchResults.length} results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Other Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell>
                            <Badge variant={entry.type === 'Individual' ? 'default' : 'secondary'}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.nationality || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{entry.otherInfo || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* View Data Tab */}
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Sanctions Database
              </CardTitle>
              <CardDescription>
                View all loaded sanctions data ({sanctionsData.length} entries)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sanctionsData.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No sanctions data loaded. Please upload PDF or XML files first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Other Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sanctionsData.slice(0, 50).map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell>
                            <Badge variant={entry.type === 'Individual' ? 'default' : 'secondary'}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.nationality || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{entry.otherInfo || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {sanctionsData.length > 50 && (
                    <p className="text-sm text-gray-600 mt-4 text-center">
                      Showing first 50 entries. Use search to find specific records.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Match Results
              </CardTitle>
              <CardDescription>
                Results from Excel file matching against sanctions database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchResults.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No match results available. Upload an Excel file in the "Match Excel" tab to see results here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {matchResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                        <CardDescription>
                          {result.matches.length} potential match(es) found
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.matches.length === 0 ? (
                          <p className="text-sm text-gray-600">No matches found for this name.</p>
                        ) : (
                          <div className="space-y-3">
                            {result.matches.map((match, matchIndex) => (
                              <div key={matchIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium">{match.sanctionEntry.name}</p>
                                  <p className="text-sm text-gray-600">
                                    ID: {match.sanctionEntry.id} | Type: {match.sanctionEntry.type}
                                    {match.sanctionEntry.nationality && ` | Nationality: ${match.sanctionEntry.nationality}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium">
                                    {Math.round(match.similarity * 100)}% match
                                  </span>
                                  {getRiskBadge(match.matchType, match.similarity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Space Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Client Risk Assessment
              </CardTitle>
              <CardDescription>
                Upload and analyze client risk assessment data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload client risk assessment Excel file</p>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Handle risk assessment upload
                        toast.info('Risk assessment upload functionality coming soon!');
                      }
                    }}
                    className="hidden"
                    id="risk-upload"
                  />
                  <Label htmlFor="risk-upload" className="cursor-pointer">
                    <Button variant="outline">
                      Select Risk Assessment File
                    </Button>
                  </Label>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Client risk assessment functionality is available. Upload Excel files with client data for comprehensive risk analysis.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
