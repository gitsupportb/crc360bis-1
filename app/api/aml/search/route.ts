import { NextRequest, NextResponse } from 'next/server';

// Function to get current sanctions data
async function getSanctionsData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aml/sanctions`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching sanctions data:', error);
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const idFilter = searchParams.get('idFilter') || '';
    const nameFilter = searchParams.get('nameFilter') || '';
    const typeFilter = searchParams.get('typeFilter') || '';
    const nationalityFilter = searchParams.get('nationalityFilter') || '';
    const perPage = parseInt(searchParams.get('perPage') || '20');

    // Get current sanctions data
    const data = await getSanctionsData();
    
    let filteredData = data;

    // Apply filters
    if (idFilter) {
      filteredData = filteredData.filter((entry: any) => 
        entry.id.toLowerCase().includes(idFilter.toLowerCase())
      );
    }

    if (nameFilter) {
      filteredData = filteredData.filter((entry: any) => 
        entry.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (typeFilter) {
      filteredData = filteredData.filter((entry: any) => 
        entry.type === typeFilter
      );
    }

    if (nationalityFilter) {
      filteredData = filteredData.filter((entry: any) => 
        entry.nationality && entry.nationality.toLowerCase().includes(nationalityFilter.toLowerCase())
      );
    }

    // Apply general search query
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredData = filteredData.filter((entry: any) => {
        return (
          entry.id.toLowerCase().includes(searchTerm) ||
          entry.name.toLowerCase().includes(searchTerm) ||
          (entry.nationality && entry.nationality.toLowerCase().includes(searchTerm)) ||
          (entry.otherInfo && entry.otherInfo.toLowerCase().includes(searchTerm)) ||
          (entry.address && JSON.stringify(entry.address).toLowerCase().includes(searchTerm))
        );
      });
    }

    // Apply pagination
    let paginatedData = filteredData;
    if (perPage > 0) {
      paginatedData = filteredData.slice(0, perPage);
    }

    return NextResponse.json(paginatedData);

  } catch (error) {
    console.error('Error searching sanctions data:', error);
    return NextResponse.json({ error: 'Failed to search sanctions data' }, { status: 500 });
  }
}
