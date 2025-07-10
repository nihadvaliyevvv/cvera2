// Comprehensive test for CV export functionality
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Mock CV data for testing
const mockCVData = {
  personalInfo: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+994501234567',
    address: 'Baku, Azerbaijan',
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/testuser',
    github: 'https://github.com/testuser',
    summary: 'Experienced software developer with expertise in full-stack development.'
  },
  experience: [
    {
      id: '1',
      company: 'Tech Company',
      position: 'Senior Developer',
      location: 'Baku, Azerbaijan',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      description: 'Led development of web applications using React and Node.js.',
      current: false
    }
  ],
  education: [
    {
      id: '1',
      institution: 'Technical University',
      degree: 'Bachelor of Computer Science',
      location: 'Baku, Azerbaijan',
      startDate: '2016-09-01',
      endDate: '2020-06-30',
      gpa: '3.8'
    }
  ],
  skills: [
    {
      id: '1',
      name: 'JavaScript',
      level: 'Expert',
      category: 'Programming'
    },
    {
      id: '2',
      name: 'React',
      level: 'Advanced',
      category: 'Frontend'
    }
  ],
  languages: [
    {
      id: '1',
      name: 'English',
      level: 'Fluent'
    },
    {
      id: '2',
      name: 'Turkish',
      level: 'Native'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'CVera Platform',
      description: 'Professional CV platform with LinkedIn integration',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      url: 'https://cvera.az',
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Developer Associate',
      issuer: 'Amazon Web Services',
      date: '2023-06-15',
      url: 'https://aws.amazon.com/certification/',
      expirationDate: '2026-06-15'
    }
  ]
};

async function testExportFlow() {
  console.log('🚀 Starting comprehensive CV export test...\n');
  
  try {
    // 1. Test health endpoint first
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed');
    console.log(`   - PDF Export: ${healthResponse.data.features.pdfExport}`);
    console.log(`   - DOCX Export: ${healthResponse.data.features.docxExport}`);
    
    if (!healthResponse.data.features.pdfExport || !healthResponse.data.features.docxExport) {
      console.log('❌ Export features are disabled');
      return;
    }
    
    // 2. Test user registration
    console.log('\n2. Testing user registration...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: testEmail,
      password: testPassword
    }).catch(err => {
      console.log('Registration error (expected if user exists):', err.response?.data || err.message);
      return null;
    });
    
    // 3. Test user login
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    }).catch(err => {
      console.log('Login error:', err.response?.data || err.message);
      return null;
    });
    
    if (!loginResponse) {
      console.log('❌ Could not authenticate user');
      return;
    }
    
    const accessToken = loginResponse.data.accessToken;
    console.log('✅ Authentication successful');
    
    // 4. Create a test CV
    console.log('\n4. Creating test CV...');
    const createCVResponse = await axios.post(`${BASE_URL}/api/cvs`, {
      title: 'Test CV for Export',
      cv_data: mockCVData
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('CV creation error:', err.response?.data || err.message);
      return null;
    });
    
    if (!createCVResponse) {
      console.log('❌ Could not create CV');
      return;
    }
    
    const cvId = createCVResponse.data.id;
    console.log('✅ CV created successfully:', cvId);
    
    // 5. Test PDF export
    console.log('\n5. Testing PDF export...');
    const pdfResponse = await axios.post(`${BASE_URL}/api/cvs/${cvId}/download`, {
      format: 'pdf'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }).catch(err => {
      console.log('PDF export error:', err.response?.data || err.message);
      return null;
    });
    
    if (pdfResponse && pdfResponse.data) {
      const pdfPath = path.join(__dirname, 'test-export.pdf');
      fs.writeFileSync(pdfPath, pdfResponse.data);
      console.log('✅ PDF export successful:', pdfPath);
      console.log(`   - Size: ${pdfResponse.data.length} bytes`);
    } else {
      console.log('❌ PDF export failed');
    }
    
    // 6. Test DOCX export
    console.log('\n6. Testing DOCX export...');
    const docxResponse = await axios.post(`${BASE_URL}/api/cvs/${cvId}/download`, {
      format: 'docx'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }).catch(err => {
      console.log('DOCX export error:', err.response?.data || err.message);
      return null;
    });
    
    if (docxResponse && docxResponse.data) {
      const docxPath = path.join(__dirname, 'test-export.docx');
      fs.writeFileSync(docxPath, docxResponse.data);
      console.log('✅ DOCX export successful:', docxPath);
      console.log(`   - Size: ${docxResponse.data.length} bytes`);
    } else {
      console.log('❌ DOCX export failed');
    }
    
    // 7. Cleanup - Delete test CV
    console.log('\n7. Cleaning up test CV...');
    await axios.delete(`${BASE_URL}/api/cvs/${cvId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }).catch(err => {
      console.log('Cleanup error:', err.response?.data || err.message);
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExportFlow();
