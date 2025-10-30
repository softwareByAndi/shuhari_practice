BEGIN;

CREATE TABLE stage (
    stage_id INTEGER PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL
);
INSERT INTO stage (stage_id, code, display_name) VALUES 
    (1, 'hatsu', '初 - Hatsu (Begin)'),
    (2, 'shu',   '守 - Shu (Obey)'),
    (3, 'kan',   '鑑 - Kan (Mirror)'),
    (4, 'ha',    '破 - Ha (Break)'),
    (5, 'toi',   '問 - Toi (Question)'),
    (6, 'ri',    '離 - Ri (Leave)'),
    (7, 'ku',    '空 - Ku (Void)')
;

CREATE TABLE difficulty_progression (
    difficulty_progression_id INTEGER PRIMARY KEY,
    code  VARCHAR(50) UNIQUE NOT NULL,
    hatsu INT NOT NULL,
    shu   INT NOT NULL,
    kan   INT NOT NULL,
    ha    INT NOT NULL,
    toi   INT NOT NULL,
    ri    INT NOT NULL
);
INSERT INTO difficulty_progression
(difficulty_progression_id,  code,       hatsu, shu,  kan,   ha,    toi,    ri) 
VALUES (1,                  'standard',  1000,  5000, 10000, 50000, 250000, 5000000),
       (2,                  'kids_mode', 10,    100,  500,   2000,  5000,   20000)
;



CREATE TABLE difficulty_level (
    difficulty_level_id INTEGER PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    character VARCHAR(4) NOT NULL,
    pronunciation VARCHAR(50),
    description TEXT
);
INSERT INTO difficulty_level 
(difficulty_level_id, code, display_name, character, pronunciation, description) 
VALUES  (101, '1d', 'Seedling',    '種',   'tane',    'Just planted, beginning to grow'),
        (102, '2d', 'Sapling',     '若木', 'wakagi',  'Young tree finding its strength'),
        (103, '3d', 'Bamboo',      '竹',   'take',    'Flexible yet strong, rapid growth'),
        (104, '4d', 'Cedar',       '杉',   'sugi',    'Steady, established presence'),
        (105, '5d', 'Ancient Oak', '老木', 'rouboku', 'Deep roots, mastery')
;


CREATE TABLE field (
    field_id INTEGER PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);
INSERT INTO field (field_id, code, display_name, is_active) 
VALUES  (101, 'math', 'Mathematics', TRUE)
;
INSERT INTO field (field_id, code, display_name)
VALUES  

        (121, 'chemistry',   'Chemistry'),
        (122, 'biology',     'Biology'),
        (123, 'physics',     'Physics'),
        
        (131, 'engineering', 'Engineering'),

        (201, 'language',    'Language'),
        (202, 'programming', 'Programming'),

        (301, 'history',     'History'),
        (302, 'philosophy',  'Philosophy'),
        (303, 'law',         'Law'),
        (304, 'psychology',  'Psychology'),

        (401, 'economics',   'Economics')
;


CREATE TABLE subject (
    subject_id INTEGER PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    field_id INT REFERENCES field(field_id),
    display_name VARCHAR(100) NOT NULL
);
INSERT INTO subject (subject_id, code, field_id, display_name) 
VALUES (101001, 'arithmetic', 101, 'Arithmetic');


CREATE TABLE topic (
    topic_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    subject_id INT REFERENCES subject(subject_id),
    difficulty_progression_id INT REFERENCES difficulty_progression(difficulty_progression_id) DEFAULT 1,
    display_name VARCHAR(100) NOT NULL
);
INSERT INTO topic (code, subject_id, display_name) 
VALUES  ('add',  101001, 'Addition'),
        ('sub',  101001, 'Subtraction'),
        ('mul',  101001, 'Multiplication'),
        ('div',  101001, 'Division'),
        ('mod',  101001, 'Modulus'),
        ('exp',  101001, 'Exponents'),
        ('root', 101001, 'Square Roots'),
        ('add_w_negatives',      101001, 'Addition with Negatives'),
        ('subtract_w_negatives', 101001, 'Subtraction with Negatives')
;


CREATE TABLE topic_difficulty_option (
    topic_difficulty_option_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topic(topic_id),
    difficulty_level_id INT REFERENCES difficulty_level(difficulty_level_id)
);
WITH difficulty_levels AS (
    SELECT difficulty_level_id
    FROM difficulty_level
    WHERE code IN ('1d', '2d', '3d', '4d', '5d')
)
INSERT INTO topic_difficulty_option (topic_id, difficulty_level_id) 
SELECT t.topic_id, dl.difficulty_level_id
FROM topic t, difficulty_levels dl
WHERE t.code IN (
    'add', 'sub', 'mul', 'div', 'mod', 'exp', 'root',
    'add_w_negatives', 'subtract_w_negatives'
);


CREATE TABLE user_progress (
    user_id  UUID REFERENCES users(id),
    topic_id INT REFERENCES topic(topic_id),
    stage_id INT REFERENCES stage(stage_id),
    PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE session (
    id SERIAL PRIMARY KEY,
    user_id  UUID REFERENCES users(id),
    topic_id INT REFERENCES topic(topic_id),
    stage_id INT REFERENCES stage(stage_id),
    start_time TIMESTAMP NOT NULL,
    end_time   TIMESTAMP NOT NULL,
    total_reps INT NOT NULL,
    avg_response_time    FLOAT NOT NULL,
    median_response_time FLOAT NOT NULL,
    accuracy FLOAT NOT NULL
);


COMMIT;