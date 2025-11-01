import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exportData() {
  console.log('Starting data export from Supabase...');

  try {
    // Export fields
    console.log('Exporting fields...');
    const { data: fields, error: fieldsError } = await supabase
      .from('field')
      .select('*')
      .order('field_id');

    if (fieldsError) throw fieldsError;

    // Export subjects
    console.log('Exporting subjects...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subject')
      .select('*')
      .order('subject_id');

    if (subjectsError) throw subjectsError;

    // Export topics
    console.log('Exporting topics...');
    const { data: topics, error: topicsError } = await supabase
      .from('topic')
      .select('*')
      .order('topic_id');

    if (topicsError) throw topicsError;

    // Export stages
    console.log('Exporting stages...');
    const { data: stages, error: stagesError } = await supabase
      .from('stage')
      .select('*')
      .order('stage_id');

    if (stagesError) throw stagesError;

    // Export difficulty levels
    console.log('Exporting difficulty levels...');
    const { data: difficultyLevels, error: difficultyLevelsError } = await supabase
      .from('difficulty_level')
      .select('*')
      .order('difficulty_level_id');

    if (difficultyLevelsError) throw difficultyLevelsError;

    // Export difficulty progressions
    console.log('Exporting difficulty progressions...');
    const { data: difficultyProgressions, error: difficultyProgressionsError } = await supabase
      .from('difficulty_progression')
      .select('*')
      .order('difficulty_progression_id');

    if (difficultyProgressionsError) throw difficultyProgressionsError;

    // Export topic difficulty options
    console.log('Exporting topic difficulty options...');
    const { data: topicDifficultyOptions, error: topicDifficultyOptionsError } = await supabase
      .from('topic_difficulty_option')
      .select('*');

    if (topicDifficultyOptionsError) throw topicDifficultyOptionsError;

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'lib', 'static-data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write data to JSON files
    const staticData = {
      fields: fields || [],
      subjects: subjects || [],
      topics: topics || [],
      stages: stages || [],
      difficultyLevels: difficultyLevels || [],
      difficultyProgressions: difficultyProgressions || [],
      topicDifficultyOptions: topicDifficultyOptions || []
    };

    // Write combined file
    fs.writeFileSync(
      path.join(dataDir, 'all-data.json'),
      JSON.stringify(staticData, null, 2)
    );

    // Write individual files for easier imports
    fs.writeFileSync(
      path.join(dataDir, 'fields.json'),
      JSON.stringify(fields || [], null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'subjects.json'),
      JSON.stringify(subjects || [], null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'topics.json'),
      JSON.stringify(topics || [], null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'stages.json'),
      JSON.stringify(stages || [], null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'difficulty-levels.json'),
      JSON.stringify(difficultyLevels || [], null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'difficulty-progressions.json'),
      JSON.stringify(difficultyProgressions || [], null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'topic-difficulty-options.json'),
      JSON.stringify(topicDifficultyOptions || [], null, 2)
    );

    // Create a timestamp file
    const timestamp = {
      exportedAt: new Date().toISOString(),
      counts: {
        fields: fields?.length || 0,
        subjects: subjects?.length || 0,
        topics: topics?.length || 0,
        stages: stages?.length || 0,
        difficultyLevels: difficultyLevels?.length || 0,
        difficultyProgressions: difficultyProgressions?.length || 0,
        topicDifficultyOptions: topicDifficultyOptions?.length || 0
      }
    };

    fs.writeFileSync(
      path.join(dataDir, 'export-info.json'),
      JSON.stringify(timestamp, null, 2)
    );

    console.log('\n✅ Data export completed successfully!');
    console.log(`📁 Data saved to: ${dataDir}`);
    console.log('\nExported counts:');
    Object.entries(timestamp.counts).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  }
}

// Run the export
exportData();