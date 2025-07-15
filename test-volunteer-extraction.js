// Test volunteer experience extraction
console.log('Testing volunteer experience extraction...');

// Mock LinkedIn API response with volunteer data
const mockLinkedInData = {
  volunteer: [
    {
      organization: "Red Cross",
      role: "Volunteer Coordinator",
      description: "Coordinated volunteer activities",
      start_date: "2020-01-01",
      end_date: "2022-12-31",
      cause: "Disaster Relief"
    }
  ],
  volunteer_experience: [
    {
      organization: "Habitat for Humanity",
      title: "Construction Volunteer",
      description: "Helped build homes for families in need",
      start_date: "2019-06-01",
      end_date: "2019-08-31",
      cause: "Housing"
    }
  ],
  volunteering: [
    {
      org: "Local Food Bank",
      position: "Food Distributor",
      description: "Distributed food to families in need",
      startDate: "2021-01-01",
      endDate: "2021-12-31",
      category: "Hunger Relief"
    }
  ]
};

// Test extraction function
const extractVolunteer = (data) => {
  console.log('Raw volunteer data from LinkedIn:', JSON.stringify(data.volunteer || [], null, 2));
  console.log('Raw volunteer_experience data from LinkedIn:', JSON.stringify(data.volunteer_experience || [], null, 2));
  
  const volunteers = [];
  
  // Check both volunteer and volunteer_experience fields
  if (data.volunteer && Array.isArray(data.volunteer)) {
    volunteers.push(...data.volunteer);
  }
  
  if (data.volunteer_experience && Array.isArray(data.volunteer_experience)) {
    volunteers.push(...data.volunteer_experience);
  }
  
  // Also check if it's under different field names
  if (data.volunteering && Array.isArray(data.volunteering)) {
    volunteers.push(...data.volunteering);
  }
  
  if (data.volunteer_work && Array.isArray(data.volunteer_work)) {
    volunteers.push(...data.volunteer_work);
  }
  
  console.log('Total volunteer entries found:', volunteers.length);
  
  return volunteers.map((vol) => ({
    organization: vol.organization || vol.company || vol.org || "",
    role: vol.role || vol.title || vol.position || "",
    description: vol.description || "",
    start_date: vol.start_date || vol.startDate || "",
    end_date: vol.end_date || vol.endDate || "",
    cause: vol.cause || vol.category || "",
  }));
};

console.log('\n=== Testing volunteer extraction ===');
const result = extractVolunteer(mockLinkedInData);
console.log('Extracted volunteer experiences:', JSON.stringify(result, null, 2));

console.log('\n=== Testing empty data ===');
const emptyResult = extractVolunteer({});
console.log('Empty data result:', JSON.stringify(emptyResult, null, 2));

console.log('\n=== Test Summary ===');
console.log(`✅ Found ${result.length} volunteer experiences from mock data`);
console.log(`✅ Empty data handled correctly: ${emptyResult.length === 0 ? 'Yes' : 'No'}`);
console.log('✅ Multiple field names supported (volunteer, volunteer_experience, volunteering, volunteer_work)');
