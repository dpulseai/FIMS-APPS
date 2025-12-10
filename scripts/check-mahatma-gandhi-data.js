/**
 * Diagnostic Script: Check Mahatma Gandhi Form Data in Database
 * 
 * This script directly queries the Supabase database to verify:
 * 1. How many Mahatma Gandhi inspections exist
 * 2. Which inspection records have form data
 * 3. Which are missing form data (causing website sync issues)
 * 
 * Usage: node scripts/check-mahatma-gandhi-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration (use your actual values)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkMahatmaGandhiData() {
  console.log('='.repeat(60));
  console.log('MAHATMA GANDHI FORM DATA DIAGNOSTIC');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Get Mahatma Gandhi category ID
    console.log('1. Finding Mahatma Gandhi category...');
    const { data: categories, error: catError } = await supabase
      .from('fims_categories')
      .select('*')
      .ilike('name', '%mahatma%gandhi%')
      .limit(5);

    if (catError) {
      console.error('Error fetching categories:', catError);
      return;
    }

    console.log('   Found categories:', categories?.map(c => ({
      id: c.id,
      name: c.name,
      form_type: c.form_type
    })));

    if (!categories || categories.length === 0) {
      console.log('   ⚠️ No Mahatma Gandhi category found!');
      return;
    }

    const categoryIds = categories.map(c => c.id);
    console.log('');

    // Get all inspections for this category
    console.log('2. Fetching Mahatma Gandhi inspections...');
    const { data: inspections, error: inspError } = await supabase
      .from('fims_inspections')
      .select('*')
      .in('category_id', categoryIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (inspError) {
      console.error('Error fetching inspections:', inspError);
      return;
    }

    console.log(`   Found ${inspections?.length || 0} inspections`);
    console.log('');

    if (!inspections || inspections.length === 0) {
      console.log('   ℹ️ No inspections created yet');
      return;
    }

    // Check which inspections have form data
    console.log('3. Checking form data for each inspection...');
    console.log('');

    let withFormData = 0;
    let withoutFormData = 0;

    for (const inspection of inspections) {
      const { data: formData, error: formError } = await supabase
        .from('mahatma_gandhi_rastriya_gramin_tapasani_praptra')
        .select('*')
        .eq('inspection_id', inspection.id)
        .maybeSingle();

      const hasFormData = formData !== null;
      
      if (hasFormData) {
        withFormData++;
        console.log(`✓ Inspection ${inspection.id.substring(0, 8)}...`);
        console.log(`  Created: ${new Date(inspection.created_at).toLocaleString()}`);
        console.log(`  Status: ${inspection.status}`);
        console.log(`  Form Data: YES`);
        console.log(`    - Work Name: ${formData.work_name || 'N/A'}`);
        console.log(`    - Officer: ${formData.officer_name || 'N/A'}`);
        console.log(`    - Gram Panchayat: ${formData.gram_panchayat || 'N/A'}`);
        console.log(`    - Village: ${formData.village || 'N/A'}`);
      } else {
        withoutFormData++;
        console.log(`✗ Inspection ${inspection.id.substring(0, 8)}...`);
        console.log(`  Created: ${new Date(inspection.created_at).toLocaleString()}`);
        console.log(`  Status: ${inspection.status}`);
        console.log(`  Form Data: MISSING! ⚠️`);
      }
      console.log('');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Inspections: ${inspections.length}`);
    console.log(`With Form Data: ${withFormData} ✓`);
    console.log(`Without Form Data: ${withoutFormData} ✗`);
    console.log('');

    if (withoutFormData > 0) {
      console.log('⚠️ PROBLEM IDENTIFIED:');
      console.log(`   ${withoutFormData} inspection(s) are missing form data in the database.`);
      console.log('   This is why the website cannot display them!');
      console.log('');
      console.log('LIKELY CAUSES:');
      console.log('   1. Form submission failed silently during insert/update');
      console.log('   2. Database permissions blocking the insert');
      console.log('   3. Validation errors on required fields');
      console.log('   4. Foreign key constraint issues');
    } else if (withFormData > 0) {
      console.log('✓ All inspections have form data in the database!');
      console.log('');
      console.log('If website still cannot see data, check:');
      console.log('   1. Website RLS (Row Level Security) policies');
      console.log('   2. Website query joins and WHERE conditions');
      console.log('   3. Website user authentication/permissions');
      console.log('   4. Website cache (try hard refresh)');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkMahatmaGandhiData();
