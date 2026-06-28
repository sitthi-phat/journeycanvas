# English Arena — Phase 1 Requirements (Idea Source)

> Source: exported from Loop app. Captured as a **source of ideas** for building Arena journey boards.
> Original wording preserved (incl. Thai). Status: **in progress — ~20 content sections being added.**

---

## Phase 1: English Arena

- **Product:** English Arena / Smart Learning Platform
- **Primary User:** Teachers / Students
- **Platform:** Desktop Web / Tablet Web / Mobile
- **Primary Goal:** สร้าง foundation สำหรับครูและนักเรียนในการเริ่มใช้งานระบบ และจัดกิจกรรมการเรียนการสอนในชั้นเรียน พร้อมประเมินผลท้ายบทเรียน ได้ครบกระบวนการเรียนรู้ **6 Steps of Learning**
- **Target Timeline:** ... months (... 2026 – Nov 2027)

**AI ที่ใช้ใน Phase 1:**
- AI Assessment, speaking
- AI Assessment, writing

---

## 1. Objective

Phase 1 มีเป้าหมายเพื่อสร้างระบบพื้นฐานให้ครูและนักเรียนจัดกิจกรรมการเรียนรู้ในชั้นเรียน รวมทั้งประเมินผลท้ายบทเรียน โดยแบ่งการแสดงผลเป็น 2 ฝ่าย คือครูและนักเรียน ดังนี้

### ครู (Teacher)
- เข้าระบบจาก Landing Page ในฐานะครู
- ทำ Onboarding ให้เสร็จก่อนใช้งาน (Tutorial การใช้ระบบ)
- Download เอกสารได้ตามสิทธิ์ (คู่มือการใช้งานสำหรับครู)
- สร้างห้องเรียน ใน Classroom Management
- ตั้งค่าห้องเรียน: เลือกระดับชั้น / เลือกระดับ CEFR เป้าหมาย / ตั้งค่าห้องเรียนเบื้องต้น (ชื่อวิชา/รหัสวิชา/ห้องเรียน)
- เพิ่ม/เชิญนักเรียนเข้าห้องเรียน
- ดูรายละเอียดคอร์ส ใน All Topics
- เพิ่มคอร์สจาก All Topics เข้าห้องเรียนใน Classroom Management
- ดูรายละเอียดของคอร์ส (Unit, Activity, Unit Test, Mid-Final Test) จากส่วน Contents ใน Classroom Management
- เข้าสู่ Teaching Mode (Live)
- ใช้ Table of Contents, Zoom/Fit to Screen, Timer, Click to Answer / Show All Answer, Assigns Homework
- จบการสอนและบันทึก Progress
- ตรวจและให้คะแนนงานในส่วน Assignments ใน Classroom Management
- มอบหมายแบบทดสอบ Unit Test จาก Contents
- ติดตามผลการทำแบบทดสอบใน Test
- ติดตามผลความคืบหน้าของห้องเรียน / รายบุคคล ใน Report

### นักเรียน (Student)
- เข้าระบบจาก Landing Page ในฐานะนักเรียน
- ทำ Onboarding ให้เสร็จก่อนใช้งาน
- Download เอกสารได้ตามสิทธิ์ (คู่มือการใช้งานทั่วไปสำหรับนักเรียน)
- ทำ Placement Test (CEFR-based)
- เข้าห้องเรียนที่ครูสร้าง (กรอกรหัส/โค้ด/ลิงก์)
- เข้าสู่ Learning Mode (Live)
- Interact ใน Activity ต่าง ๆ ในชั้นเรียนที่ครู Live ได้
- จบบทเรียนและบันทึก progress
- ทำและส่งงานตามที่ครูมอบหมาย ใน Assignments
- ดูผลคะแนนใน Assignments
- ทำแบบทดสอบใน Test
- ดูผลคะแนนใน Test
- ติดตามผลความคืบหน้าของตนเอง ใน My Progress

---

## 2. Scope Summary

### Teacher's Dashboard
- Home
- Classroom Management
  - Classroom
    - Contents
      - Unit 1
      - Unit Test 1
    - Students
      - Student 1
      - Student ..
    - Assignments
      - Task 1
        - Student 1: ... points
        - Student ...: ... points
    - Tests
      - Unit Test 1
        - Class Test Report
          - Student 1: Test Report
          - Student...: Test Report
    - Reports
      - Class Progression
      - Student Report
- All Topics
- Practice (More CEFR Mock Test)

### Student's Dashboard
- Home
- Placement Test
- Classroom
  - Class
    - Contents
      - Unit 1
    - Assignments
      - Task 1
        - Submit Assignment
    - Tests
      - Unit Test 1
        - Student Test Report
    - My Progress
      - Student Report

### 2.1 Teacher Features

| Module / Function |
| --- |
| Landing Page |
| Onboarding |
| Document Download for entitled courses |
| All Topics |
| Classroom Course Detail |
| Course Detail / Unit / Activity Preview |
| Unit Detail |
| Classroom Management |
| Add Course to Classroom |
| Teaching Mode Preview |
| Table of Contents |
| Current Position / Progress Indicator |
| Previous / Next Navigation |
| Zoom / Fit to Screen |
| Teaching Tools Timer |
| Activity Templates |
| End Teaching |
| Assigns Tasks (Project) |
| Assigns Unit Test |
| See Class Test Result |
| See Students Test Result |
| See Class Overall Report |
| See Students Report |
| Live Class Control Panel |
| Export Reports |
| Teacher Notification |

### 2.2 Student Features

| Feature |
| --- |
| Landing Page |
| Onboarding |
| Placement Test |
| Students Join Code |
| Student Course Overview |
| Student Live Mode follow teacher |
| Activity interaction in Live Mode |
| Student Resume |
| Student Progress from teacher completed slides |
| Assignments |
| Test |
| Report |
| Student notification |

---

## 3. Modules

### 3.1 Teacher's Modules
- 3.1.1 Landing Page
- 3.1.2 Onboarding
- 3.1.3 All Topics
- 3.1.4 Classroom Management
- 3.1.5 Classroom Details
- 3.1.6 Classroom Contents
- 3.1.7 Teaching Mode
- 3.1.8 Teaching Mode: Table of Contents
- 3.1.9 Teaching Mode: Teaching Tools
- 3.1.10 Teaching Mode: Activity Templates
- 3.1.11 Teaching Mode: Assigns Homework
- 3.1.12 Classroom Contents: Assignments
- 3.1.13 Classroom: Unit Test / Mid-Final Test
- 3.1.14 Classroom: Test
- 3.1.15 AI Assessment - speaking and writing
- 3.1.16 Classroom: Report
- 3.1.17 Teacher Notification
- Teacher's Dashboard

### 3.2 Student's Modules
- 3.2.1 Landing Page
- 3.2.2 Onboarding
- 3.2.3 Placement Test
- 3.2.4 Classroom
- 3.2.5 Classroom Contents
- 3.2.6 Learning Mode
- 3.2.7 Learning Mode: Activity Template
- 3.2.8 Classroom: Assignments
- 3.2.9 Classroom: Test
- 3.2.10 Student AI Feedback
- 3.2.11 Classroom: Student Report / My Progress
- 3.2.12 Student Notification
- Student's Dashboard

---

## Teacher Board (navigation tree)

- Home
- Classroom Management
  - Class
    - Contents
      - Unit 1
      - Unit Test 1
    - Students
      - Student 1
      - Student ..
    - Assignments
      - Task 1
        - Student 1: ... points
        - Student ...: ... points
    - Tests
      - Unit Test 1
        - Class Test Report
          - Student 1: Test Report
          - Student...: Test Report
    - Reports
      - Class Progression
      - Student Report
- All Topics
- Practice (More CEFR Mock Test)

## Teacher's Modules — number mapping

| Section | Module |
| --- | --- |
| 3.1.1 Landing Page | Module 1: Landing Page / Home |
| 3.1.2 Onboarding | Module 2: Onboarding |
| 3.1.3 All Topics | Module 3: All Topics |
| 3.1.4 Classroom Management | Module 4: Classroom Management |
| 3.1.5 Classroom Details | Module 5: Classroom Details |
| 3.1.6 Classroom Contents | Module 6: Classroom Contents |
| 3.1.7 Teaching Mode | Module 7: Teaching Mode |
| 3.1.8 Teaching Mode: Table of Contents | Module 8: Table of Contents |
| 3.1.9 Teaching Mode: Teaching Tools | Module 9: Teaching Tools |
| 3.1.10 Teaching Mode: Activity Templates | Module 10: Activity Templates |
| 3.1.11 Teaching Mode: Assigns Homework | Module 11: Assigns Homework |
| 3.1.12 Classroom Contents: Assignments | Module 12: Assignment |
| 3.1.13 Classroom: Unit Test / Mid-Final Test | Module 13: Unit Test / Mid-Final Test |
| 3.1.14 Classroom: Test | Module 14: Test |
| 3.1.15 AI Assessment - speaking and writing | Module 15: AI Assessment Review — Speaking / Writing |
| 3.1.16 Classroom: Report | Module 16: Report |
| 3.1.17 Teacher Notification | Module 17: Teacher Notification |

---

## Teacher Board — Module Details

### Module 1: Landing Page / Home

**1. Description**
Landing Page เป็น public entry page สำหรับผู้ใช้ก่อนเข้าสู่ระบบ รองรับภาษาไทย/ภาษาอังกฤษ

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-LP-001 | Landing Page ต้องเป็น public page ที่เปิดดูได้โดยไม่ต้อง login |
| T1-LP-002 | ต้องมี CTA หลักสำหรับ Teacher เช่น "Login as Teacher" หรือ "Teacher Login" |
| T1-LP-003 | CTA ของ Teacher ต้อง redirect ไปหน้า Login |
| T1-LP-004 | ต้องแสดงภาพรวม product เช่น CEFR Smart Learning, Classroom Activities, Assessment, Report |
| T1-LP-005 | ต้องรองรับทั้งภาษาไทยและภาษาอังกฤษ |
| T1-LP-006 | ต้องแสดง product preview image หรือ static state image ได้ |
| T1-LP-007 | ต้องแยกทางเข้า Teacher และ Student ให้ชัดเจน |
| T1-LP-008 | ต้องแสดง link ไปยัง Help / User Guide / Contact Support ได้ |

**3. Business Rules**
- ผู้ใช้ที่ยังไม่ login สามารถดู Landing Page ได้
- การเข้า Teacher Dashboard ต้องผ่าน authentication
- ต้องรองรับทั้งภาษาไทยและภาษาอังกฤษ (language switcher)

---

### Module 2: Onboarding

**1. Description**
Onboarding เป็น tutorial สำหรับ Teacher เพื่อแนะนำวิธีเริ่มต้นใช้งานระบบ

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-OB-001 | ระบบต้องแสดง onboarding เมื่อ Teacher เข้าใช้งานครั้งแรก |
| T1-OB-002 | Teacher ต้องสามารถดูขั้นตอนการใช้งานพื้นฐานในการ Create Class ได้ |
| T1-OB-003 | Teacher ต้องสามารถเลือกระดับชั้น ระดับ CEFR เป้าหมาย และใส่ข้อมูลพื้นฐานของชั้นเรียนได้ |
| T1-OB-004 | Teacher สามารถ Save Draft Classroom และย้อนกลับไปแก้ไขข้อมูลของ Classroom ภายหลังได้ |
| T1-OB-005 | Teacher สามารถลบ Draft Classroom ออกจาก Classroom ภายหลังได้ |
| T1-OB-006 | Teacher ต้องสามารถข้าม onboarding ได้ (complete Onboarding ได้โดยไม่สร้าง classroom) |
| T1-OB-007 | เมื่อ final submit สำเร็จ ระบบต้อง redirect ไป All Topics |

**3. Business Rules**
- Onboarding เป็น mandatory flow
- Classroom creation ใน Onboarding เป็น optional
- Classroom draft จะถูกบันทึกเข้า Classroom Mangaement หลัง final submit เท่านั้น
- หลัง Onboarding สำเร็จ user ต้องไปหน้า All Topics

---

### Module 3: All Topics

**1. Description**
All Topics เป็นคลังบทเรียนทั้งหมดที่ Teacher สามารถค้นหา ดูรายละเอียด และเลือกเพิ่มเข้าห้องเรียน โดยแบ่งตามระดับชั้น และระดับ CEFR ที่เหมาะสมกับระดับนั้น ๆ

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-AT-001 | Teacher ต้องสามารถค้นหาคอร์สได้ |
| T1-AT-002 | Teacher ต้องสามารถ filter คอร์สตามระดับชั้น / ระดับ CEFR ได้ |
| T1-AT-003 | Teacher ต้องสามารถเห็นคอร์สทั้งหมดได้ |
| T1-AT-004 | Teacher ต้องสามารถกดดูรายการ course / topic ที่มีสิทธิ์ใช้งานได้ |
| T1-AT-005 | Teacher ต้องไม่สามารถกดดูรายการ course / topic ที่ตนเองไม่มีสิทธิ์ (locked state) |
| T1-AT-006 | Course card ต้องแสดง cover image, course title, grade, CEFR level, status |
| T1-AT-007 | Teacher ต้องสามารถเปิด Course Detail ได้ |
| T1-AT-008 | Course Detail ต้องแสดง Course Overview, Unit Overview, Lesson Overview และ Estimated teaching time |
| T1-AT-009 | Teacher ต้องสามารถดู Unit Detail ได้ |
| T1-AT-010 | Teacher ต้องสามารถ Preview activity ได้ |
| T1-AT-011 | Activity Preview ต้องแสดง Activity content ตามหัวข้อย่อย Vocabulary, Grammar, Listening, Reading, Speaking, Writing, Project |
| T1-AT-012 | Course Detail ต้องแสดง documents เมื่อมีข้อมูล (แผนการสอน) |
| T1-AT-013 | Teacher ที่มีสิทธิ์ต้องสามารถ download documents ของ course นั้น ๆ ได้ |
| T1-AT-014 | Teacher ที่ไม่มีสิทธิ์ต้องไม่สามารถ download documents ได้ |
| T1-AT-015 | Teacher ที่มีสิทธิ์ต้องสามารถ Add Course to Classroom ได้ |
| T1-AT-016 | Teacher ที่ไม่มีสิทธิ์ต้องไม่สามารถ Add Course to Classroom ได้ |
| T1-AT-017 | Add Course to Classroom ต้องรองรับการเลือกหลายห้องเรียน |
| T1-AT-018 | Course ที่อยู่ใน classroom ของห้องเรียนนั้น ๆ แล้วต้องแสดง locked state ไม่ให้เลือกห้องเรียนซ้ำ |
| T1-AT-019 | หลัง add course สำเร็จ ระบบต้องแสดง success state |

**3. Business Rules**
- Teacher เห็นเฉพาะ topic ที่ตนมีสิทธิ์
- Course สามารถ add ไปยังหลาย classroom ได้
- Topic ที่ถูกเพิ่มเข้าห้องเรียนนั้น ๆ แล้วต้องแสดงสถานะ "Added" และเลือกซ้ำห้องเรียนเดิมไม่ได้
- Course Detail component สามารถใช้ร่วมกันระหว่าง All topics context และ Classroom context ได้

---

### Module 4: Classroom Management

**1. Description**
Classroom Management ใช้สร้างและจัดการห้องเรียน นักเรียน คอร์ส และ settings ของห้องเรียน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-CM-001 | Classroom Mangement ต้องแสดง Classroom Header, Search, Filter, Sort, Create Class และ Add Course |
| T1-CM-002 | Teacher ต้องสามารถสร้าง Classroom ได้ |
| T1-CM-003 | Grade / CEFR Target / Classroom number เป็น required field |
| T1-CM-004 | Subject / Subject code / School Year / Semester / Classroom name เป็น optional field |
| T1-CM-005 | Teacher ต้องสามารถแก้ไข Classroom ได้ |
| T1-CM-006 | Teacher ต้องสามารถ Archive Classroom ที่สอนจบแล้วได้ |
| T1-CM-007 | Teacher ต้องสามารถมองเห็น Classroom ทั้งหมดที่มีได้ |
| T1-CM-008 | ระบบต้องแสดง classroom cards ตาม grade |
| T1-CM-009 | Teacher ต้องสามารถเพิ่มคอร์สเข้าห้องเรียน จาก All Topics ได้ |
| T1-CM-010 | Add Course Modal ต้องแสดงเฉพาะคอร์สที่มีสิทธิ์ |
| T1-CM-010 (dup) | Course ที่อยู่ใน Classroom แล้วต้องแสดงผล locked |
| T1-CM-011 | Teacher ต้องสามารถเชิญนักเรียนผ่าน join code / link / QR code ได้ |
| T1-CM-012 | Join Code ต้อง unique ในแต่ละ classroom |
| T1-CM-013 | Teacher ต้องเห็นรายชื่อนักเรียนใน classroom |
| T1-CM-014 | Teacher ต้องเห็นสถานะนักเรียน เช่น joined, pending, inactive |
| T1-CM-015 | Teacher ต้องสามารถลบนักเรียนออกจากห้องได้ |

> ⚠️ Note: ID `T1-CM-010` appears twice in the source (duplicate numbering).

**3. Business Rules**
- Grade / CEFR Target / Classroom number เป็น required field
- Subject / Subject code / School Year / Semester / Classroom name เป็น optional field
- Add Course ต้องแสดงเฉพาะ course ที่มีสิทธิ์
- Join code ต้อง unique ต่อห้องเรียน
- Student หนึ่งคนสามารถอยู่ได้หลาย classroom
- Archived class เปิด Teaching Mode ใหม่ไม่ได้ แต่ดู report ย้อนหลังได้

---

### Module 5: Classroom Details

**1. Description**
Classroom Course Detail คือ Course Detail ใน context ของ classroom โดยแสดง contents (unit list / unit test), assignments, test, report ที่อยู่ในห้องเรียน พร้อม action สำหรับเข้าสู่การสอน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-CD-001 | Teacher ต้องสามารถเปิด Classroom Detail จาก Classroom Card ใน Classroom Management ได้ |
| T1-CD-002 | Page ต้องแสดง Classroom Details ซึ่งมี Contents, Students, Assignments และ Report |
| T1-CD-003 | Contents ต้องเห็น Unit list + Unit test ทั้งหมดใน course |
| T1-CD-007 | Assignment ต้องแสดงผล งานที่ถูกมอบหมายให้ชั้นเรียน |
| T1-CD-008 | Test ต้องแสดงผล Test ที่ถูกมอบหมายให้ชั้นเรียน เช่น Unit Test |
| T1-CD-009 | Report ต้องแสดงผลการเรียนรู้ ความคืบหน้าของ Classroom และ Student เป็นรายบุคคล |

> ⚠️ Note: source skips IDs T1-CD-004…006.

**3. Business Rules**
- Report ต้องแสดงผลทั้ง Classroom และ Student เป็นรายบุคคล
- Report ส่วนของ Student รายบุคคล ใช้ร่วมกับ Students Report Module

---

### Module 6: Classroom Contents

**1. Description**
Classroom Unit Detail แสดงรายละเอียดของ unit ใน context ของ classroom-course รวมถึง lesson plans, activity list และ pre/post-test documents

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-CC-001 | Teacher ต้องสามารถเปิด Contents จาก Classroom Details ได้ |
| T1-CC-002 | Teacher ต้องเห็น Unit list + Unit Test ทั้งหมดใน course |
| T1-CC-003 | Unit row ต้องแสดง title, thumbnail, metadata และ progress |
| T1-CC-004 | Unit row ต้องมี CTA สำหรับ start teaching / continue teaching ตาม context |
| T1-CC-005 | Teacher ต้องสามารถพรีวิว Activity ทั้งหมดใน Unit ได้ |
| T1-CC-006 | Activity row ต้องแสดง thumbnail, title, resource type และ duration |
| T1-CC-007 | Teacher ต้องสามารถ start specific activity ได้ |
| T1-CC-008 | Teacher ต้องมอบหมาย assignment/project จาก activity ได้ |
| T1-CC-009 | Teacher ต้องมอบหมาย Unit Test จากหน้านี้ได้ |
| T1-CC-010 | Unit Test ต้องแสดงปุ่ม assigns เพื่อมอบหมาย test ให้ชั้นเรียน |
| T1-CC-011 | Unit Test ที่ถูก assign แล้วจะแสดง locked state |

---

### Module 7: Teaching Mode

**1. Description**
Teaching Mode เป็นหน้าหลักสำหรับครูระหว่างการสอน โดย Phase 1 จะเข้าสู่ Preview Mode ก่อนทุกกรณี และรองรับ navigation, current position, progress indicator, resume progress และการแสดงผลเนื้อหาการสอน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-TM-001 | User ต้องสามารถเข้า Teaching Mode จาก Classroom Contents ได้ |
| T1-TM-002 | User ต้องสามารถเข้า Teaching Mode จาก Unit Row ได้ |
| T1-TM-003 | ทุกกรณีต้องเข้าสู่ Preview Mode ก่อนเริ่มสอนจริง |
| T1-TM-004 | Teacher ต้องเห็น Table of Contents ของบทเรียน แสดงเป็น side panel ด้านข้าง |
| T1-TM-005 | หากมี progress อยู่แล้ว ระบบต้อง resume ไปยัง page ล่าสุดที่ยังมองเห็นได้ |
| T1-TM-006 | หากไม่มี progress ระบบต้องเริ่มจาก page แรกที่พร้อมใช้งาน |
| T1-TM-007 | ระบบต้องแสดง Current Position ตลอดเวลา |
| T1-TM-008 | Current Position ต้องแสดง lesson, activity และ page ปัจจุบัน |
| T1-TM-009 | ระบบต้องแสดง Progress Indicator ของ lesson |
| T1-TM-010 | ระบบต้องแสดง Session Timer ไว้ด้านบนเสมอ |
| T1-TM-011 | Teacher ต้องสามารถกด Previous และ Next ได้ |
| T1-TM-012 | การเปลี่ยน page ต้องไม่ reload ทั้งหน้า |
| T1-TM-013 | เมื่อเปลี่ยน page ระบบต้อง update content และ state ที่เกี่ยวข้องทั้งหมด |
| T1-TM-014 | ระบบต้องรองรับการ resume session ล่าสุด |
| T1-TM-015 | Teacher ต้องสามารถใช้ Teaching Tools ประกอบ Activity ได้ทุกหน้า ประกอบด้วย zoom / fit to screen, timer, answer reveal |
| T1-TM-016 | Teacher ต้องเห็นว่า slide/activity ใดมี answer key |
| T1-TM-017 | Teacher ต้องสามารถ start live session ได้ |
| T1-TM-018 | Teacher ต้องสามารถ push current activity ไปยัง Student screen ได้ |
| T1-TM-019 | Teacher ต้องสามารถ lock / unlock student screen ได้ |
| T1-TM-020 | Teacher ต้องสร้าง assigns homework จาก Activity ได้ |
| T1-TM-021 | User ต้องสามารถออกจาก Teaching Mode ได้ผ่าน End Live session |
| T1-TM-022 | ระบบต้องบันทึก progress อัตโนมัติหลังจบ session |

**3. Business Rules**
- Teaching Mode ต้องเปิดใน Preview Mode ก่อนทุกครั้ง
- Resume ต้องอ้างอิงจาก progress ล่าสุดของ Unit
- Progress ที่ complete แล้วต้องไม่ถูกลดสถานะกลับ
- Student ใน Live Mode ต้อง follow current activity ที่ Teacher ส่งให้
- เมื่อ Teacher end teaching ระบบต้องบันทึก completed activities

---

### Module 8: Table of Contents

**1. Description**
Table of Contents (TOC) เป็น side panel สำหรับแสดงโครงสร้างเนื้อหาทั้งหมดของ unit และช่วยให้ครูสามารถนำทางไปยัง page ที่ต้องการได้

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-TOC-001 | User ต้องสามารถเปิด TOC ได้จาก Teaching Mode |
| T1-TOC-002 | TOC ต้องแสดงเป็น side panel ด้านซ้าย |
| T1-TOC-003 | User ต้องสามารถเปิด-ปิด TOC ได้ โดยไม่กระทบ Teaching Session |
| T1-TOC-004 | TOC ต้องแสดง hierarchy ของ Unit, Activity และ Page |
| T1-TOC-005 | TOC ต้อง highlight page ปัจจุบัน |
| T1-TOC-006 | Teacher ต้องสามารถเลือก activity page จาก TOC ได้ |
| T1-TOC-007 | หากเลือก page ข้าม activity ระบบต้องแสดง confirmation |

**3. Business Rules**
- การเลือก slide จาก TOC ต้องไม่ reset progress

---

### Module 9: Teaching Tools

**1. Description**
Teaching Tools เป็นชุดเครื่องมือสำหรับช่วยครูระหว่างการสอน ประกอบด้วย Zoom/Fit screen, Timer, Annotate

**2. Functional Requirements**

#### 2.1 Zoom In/Out, Fit Screen
Zoom In/Out, Fit Screen เป็นเครื่องมือช่วยปรับขนาดหน้าจอระหว่างสอน

| ID | Requirement |
| --- | --- |
| T1-ZOOM-001 | Teacher ต้องสามารถ Zoom In ได้ |
| T1-ZOOM-002 | Teacher ต้องสามารถ Zoom Out ได้ |
| T1-ZOOM-003 | ระบบต้องแสดงค่า Zoom ปัจจุบัน |
| T1-ZOOM-004 | ระบบต้องมี Fit to Screen |
| T1-ZOOM-005 | Fit to Screen ต้องคำนวณตามพื้นที่ที่เหลืออยู่จริง |
| T1-ZOOM-006 | Zoom ต้องมี min และ max limit |
| T1-ZOOM-007 | Zoom ต้องกระทบเฉพาะ Teaching Content Area |
| T1-ZOOM-008 | การ resize browser ต้องคำนวณ Fit ใหม่อัตโนมัติ |
| T1-ZOOM-009 | ระบบต้องรักษา aspect ratio ของเนื้อหา |
| T1-ZOOM-010 | Refresh page แล้ว Zoom ต้องกลับค่า default |

#### 2.2 Session Timer / End Teaching
Session Timer ใช้ติดตามระยะเวลาการสอน และ End Teaching ใช้สำหรับจบ session พร้อมบันทึกข้อมูลการสอน

| ID | Requirement |
| --- | --- |
| T1-END-001 | ระบบต้องแสดง Session Timer ระหว่าง Teaching Mode |
| T1-END-002 | Timer ต้องเริ่มทำงานเมื่อเข้าสู่ Teaching Mode |
| T1-END-003 | Timer ต้องทำงานต่อเนื่องเมื่อเปลี่ยน slide |
| T1-END-004 | Teacher ต้องสามารถกด End Teaching ได้ |
| T1-END-005 | End Teaching ต้องแสดง confirmation modal |
| T1-END-006 | Modal ต้องแสดงเวลาการสอนทั้งหมด |
| T1-END-007 | Teacher ต้องสามารถยกเลิกการจบการสอนได้ |
| T1-END-008 | เมื่อยืนยัน ระบบต้องบันทึกข้อมูลการสอน |
| T1-END-009 | ระหว่างบันทึกต้องแสดง loading state |
| T1-END-010 | Save สำเร็จต้องปิด session และบันทึก progress |

#### 2.3 Tool Timer
Tool Timer เป็นเครื่องมือช่วยจับเวลาในชั้นเรียนในแต่ละ Activity

| ID | Requirement |
| --- | --- |
| T1-TOOL-TIMER-001 | Teacher ต้องสามารถเปิด Tool Timer ได้ |
| T1-TOOL-TIMER-002 | Teacher ต้องสามารถกำหนดเวลาเป็นนาทีได้ |
| T1-TOOL-TIMER-003 | Teacher ต้องสามารถ Start, Stop และ Reset ได้ |
| T1-TOOL-TIMER-004 | Timer ต้องแสดง countdown แบบ realtime |
| T1-TOOL-TIMER-005 | เมื่อ Teacher ตั้ง Timer เวลาต้องปรากฎบนหน้าจอของ Students มุมบนซ้าย |
| T1-TOOL-TIMER-006 | เมื่อเวลาหมด page ต้องแสดง notification แจ้งเตือนหมดเวลาบนหน้าจอของนักเรียน |
| T1-TOOL-TIMER-007 | ปิด modal แล้ว Timer ต้องหยุดทำงาน |

---

### Module 10: Activity Templates

**1. Description**
Activity Templates เป็นรูปแบบกิจกรรมมาตรฐานที่ใช้ภายใน Teaching Mode

**2. Functional Requirements**

#### 2.1 Common Template Layout

| ID | Requirement |
| --- | --- |
| T1-TPL-001 | รองรับ layout แบบ Media + Activity Content |
| T1-TPL-002 | รองรับ Full Width Layout |
| T1-TPL-003 | รองรับ image, video, audio, iframe และ external link |
| T1-TPL-004 | User ต้องสามารถเปิด media แบบ modal ได้ |
| T1-TPL-005 | Teacher ต้อง click to show answer รายข้อได้ |
| T1-TPL-006 | Teacher ต้อง click to show all answer ได้ |
| T1-TPL-007 | ระบบต้องแสดงคำตอบที่ถูกต้องและคำอธิบายหลังเฉลย ในหน้าของ Students รายบุคคล |
| T1-TPL-008 | Teacher ต้องเห็นจำนวน student ที่ตอบแล้ว |
| T1-TPL-009 | Teacher ต้อง show class response summary ได้ |
| T1-TPL-010 | Teacher ต้อง save activity result เข้า report ได้ |
| T1-TPL-011 | Template ต้องรองรับ Live Mode และ Assignment |
| T1-TPL-012 | ระบบต้อง auto-score ตาม scoring rule ได้ |

#### 2.2 Media Template

| ID | Requirement |
| --- | --- |
| T1-MEDIA-001 | รองรับ iframe, video, image และ simulation |
| T1-MEDIA-002 | รองรับ interactive media |

#### 2.3 Multiple Choice
Teacher ใช้สร้างหรือเปิดกิจกรรมแบบ Multiple Choice Question ให้นักเรียนเลือกคำตอบเดียว

| ID | Requirement |
| --- | --- |
| T1-MCQ-001 | รองรับ 1-5 คำถามต่อ page |
| T1-MCQ-002 | รองรับ 4 ตัวเลือก |
| T1-MCQ-003 | รองรับ single select |

#### 2.4 True/False
Teacher ใช้กิจกรรมให้ Student ตัดสินว่าข้อความถูกหรือผิด โดยเลือก True หรือ False

| ID | Requirement |
| --- | --- |
| T1-TOF-001 | Activity ต้องรองรับ text, image, audio |
| T1-TOF-002 | รองรับ 1 คำถามต่อ page |
| T1-TOF-003 | รองรับ 2 ตัวเลือก |
| T1-TOF-004 | รองรับ single select |

#### 2.5 Multiple Select
ใช้ในกรณีที่คำตอบถูกมีมากกว่า 1 ข้อ โดยเลือกหลายคำตอบแล้ว submit

| ID | Requirement |
| --- | --- |
| T1-MPS-001 | Students ต้องตอบได้มากกว่า 1 |
| T1-MPS-002 | ระบบต้องรองรับ partial scoring ถ้าตั้งค่าไว้ |

#### 2.6 Matching
ใช้จับคู่คำกับภาพ ความหมาย คน สถานที่ หรือข้อมูล โดยลากหรือเลือกจับคู่ item ซ้ายกับ item ขวา

| ID | Requirement |
| --- | --- |
| T1-MC-001 | Matching ต้องรองรับ text-to-text |
| T1-MC-002 | Matching ต้องรองรับ image-to-word |
| T1-MC-003 | Matching ต้องรองรับ image-to-image |
| T1-MC-004 | Matching ต้องรองรับ audio-to-word |
| T1-MC-005 | Template ต้องรองรับ vocabulary matching |

#### 2.7 Drag and Drop
ใช้ให้ Student ลากคำ วลี หรือภาพไปวางในตำแหน่งที่ถูกต้อง โดยลาก item ไปยัง drop zone

| ID | Requirement |
| --- | --- |
| T1-DD-001 | Template ต้องรองรับ word tiles |
| T1-DD-002 | Template ต้องรองรับ image tiles |
| T1-DD-003 | Template ต้องรองรับ drop zones หลายตำแหน่ง |
| T1-DD-004 | Teacher ต้องกำหนด correct drop zone ได้ |
| T1-DD-005 | ระบบต้องรองรับ tablet/mobile touch interaction |

#### 2.8 Sequencing / Ordering
ใช้เรียงลำดับประโยค เหตุการณ์ ขั้นตอน หรือบทสนทนา โดยลาก item เพื่อเรียงลำดับ

| ID | Requirement |
| --- | --- |
| T1-SQ-001 | Student ต้อง rearrange text ได้ |
| T1-SQ-002 | Student ต้อง rearrange image ได้ |
| T1-SQ-003 | Template ต้องรองรับ sentence ordering และ story ordering |

#### 2.9 Fill in the Blank
ใช้ให้นักเรียนเติมคำในช่องว่าง โดยพิมพ์คำตอบหรือเลือกคำจาก word bank

| ID | Requirement |
| --- | --- |
| T1-FILL-001 | Template ต้องรองรับ typing answer |
| T1-FILL-002 | Template ต้องรองรับ word bank |
| T1-FILL-003 | ระบบต้องกำหนด acceptable answers ได้ |
| T1-FILL-004 | ระบบต้องประเมินโดยใช้ AI writing assesment ได้ |
| T1-FILL-005 | Teacher ต้องเห็นคำตอบทั้งหมดแบบ list |

#### 2.10 Short/Long Answer
ใช้ให้นักเรียนตอบคำถามสั้น ๆ เป็นคำหรือประโยค โดยพิมพ์คำตอบสั้น ๆ (คำ/ประโยค/ย่อหน้า)

> ⚠️ Note: source reuses the same `T1-FILL-00x` IDs as 2.9 (likely a copy/paste; may need its own ID prefix, e.g. T1-SLA-00x).

| ID | Requirement |
| --- | --- |
| T1-FILL-001 | Template ต้องรองรับ typing answer |
| T1-FILL-002 | Template ต้องรองรับ word bank |
| T1-FILL-003 | ระบบต้องกำหนด acceptable answers ได้ |
| T1-FILL-004 | ระบบต้องประเมินโดยใช้ AI writing assessment ได้ |
| T1-FILL-005 | Teacher ต้องเห็นคำตอบทั้งหมดแบบ list |

#### 2.11 Voice Recording
ใช้กับ Speaking โดยให้นักเรียนอัดเสียงตอบ prompt โดยกด record พูด และ submit audio

| ID | Requirement |
| --- | --- |
| T1-VOI-001 | Student ต้องทำ Mic Check ได้ |
| T1-VOI-002 | Student ต้อง record voice ได้ |
| T1-VOI-003 | Student ต้อง playback ได้ |
| T1-VOI-004 | Student ต้อง submit audio ได้ |
| T1-VOI-005 | ระบบต้องประเมินโดยใช้ AI speaking assessment ได้ |
| T1-VOI-006 | Teacher ต้องฟัง audio submissions ได้ |

**3. Business Rules**
- Activity Template ต้องทำงานได้ทั้งบน desktop, tablet และ mobile web
- Teacher ต้องเป็นผู้ควบคุมการ launch activity ใน Live Mode
- Student ต้องเห็นเฉพาะ activity ใน current page ของ Teacher
- Student ไม่สามารถกดดูเฉลยเองได้ใน Live Mode ต้องให้ครู launch ระบบถึงจะคำนวนคะแนน พร้อมคำอธิบายเฉลย
- Teacher-only information เช่น answer key, transcript, rubric, individual names ต้องไม่แสดงใน Student View
- Template ที่มี correct answer ต้องรองรับ auto-score ถ้าเป็น objective item
- Template ที่เป็น open response ต้องรองรับ Teacher review หรือ AI-assisted review
- Listening transcript ต้องแสดงเฉพาะ Teacher View
- Activity result ต้องผูกกับ classroom, unit และ report

---

### Module 11: Assigns Homework

**1. Description**
Assigns Homework เป็นระบบมอบหมายการบ้านที่อยู่ใน Lesson เมื่อมอบหมายแล้วงานจะไปขึ้นที่ Assignments ของชั้นเรียน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-AH-001 | Teacher ต้องสร้าง Assignments ได้ จาก Activity ที่ระบบกำหนด |
| T1-AH-002 | ระบบต้องแสดงปุ่ม Assigns Homework ที่ด้านล่างแต่ละ Activity เพื่อให้ Teacher ส่งให้ Student ได้ |
| T1-AH-003 | ระบบต้องแสดง confirmation modal ให้ Teacher ใส่รายละเอียด Homework เมื่อ Assign |
| T1-AH-004 | Teacher ต้องกำหนด due date และแก้ไขได้ |
| T1-AH-005 | Teacher ต้องกำหนด Instruction เป็น text, image และแก้ไขได้ |
| T1-AH-006 | Teacher ต้องเลือก assign ให้ทั้งห้อง กลุ่ม หรือรายบุคคลได้ |

---

### Module 12: Assignment

**1. Description**
Teacher สามารถมอบหมายงาน ตรวจงาน ให้คะแนน และส่ง feedback กลับให้นักเรียน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-AM-001 | Teacher ต้องสามารถดู assignment ทั้งหมดของ Classroom ได้ |
| T1-AM-002 | Page ต้อง filter เลือก Classroom และ assignment type ได้ เช่น writing, speaking, project |
| T1-AM-003 | Teacher ต้องเห็น completion status ของนักเรียนในแต่ละ activity เช่น submitted, missing, late |
| T1-AM-004 | Teacher ต้องกำหนดและแก้ไข due date ได้ |
| T1-AM-005 | Teacher ต้องกำหนดและแก้ไข instruction / rubric ได้ |
| T1-AM-006 | Teacher ต้องกำหนดและแก้ไขการ assign ให้ทั้งห้อง กลุ่ม หรือรายบุคคลได้ |
| T1-AM-007 | Teacher ต้องเปิดดูงานที่นักเรียนส่งได้ |
| T1-AM-008 | Teacher ต้องให้คะแนน Assignments เป็นห้อง กลุ่ม หรือรายบุคคลได้ |
| T1-AM-009 | Assignment ที่ตรวจโดยระบบ หรือ AI จะแสดงคะแนนอัตโนมัติ ในหน้า Assignments ของครู |
| T1-AM-010 | Teacher สามารถกดดู comment ของ AI จากงาน Speaking / Writing ได้ |
| T1-AM-011 | Teacher ต้องให้ comment / feedback ได้ |
| T1-AM-012 | Student เห็นผลคะแนนที่ตรวจโดยระบบ หรือ AI อัตโนมัติหลังทำ Activity |
| T1-AM-013 | หลังตรวจแล้ว Student ต้องสามารถเห็น feedback คะแนนและ comment / feedback ได้ |
| T1-AM-014 | Teacher ต้องอนุญาต resubmit ได้ |
| T1-AM-015 | Teacher ต้อง export assignment result ได้ |

**3. Business Rules**
- Assignment ต้องผูกกับ classroom / unit / activity ได้
- งานที่ตรวจโดยระบบ หรือ AI จะแสดงคะแนนอัตโนมัต ทั้ง Teacher และ [sic — source sentence incomplete]
- งาน Project ครูจะต้องเป็นผู้ให้คะแนนเอง
- งานที่เลย due date ต้องแสดงสถานะ late

---

### Module 13: Unit Test / Mid-Final Test

**1. Description**
Teacher สามารถมอบหมาย Unit Test และ Mid-Final Test ให้กับนักเรียนแบบรายชั้น กลุ่ม หรือรายบุคคลได้

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-UT-001 | ครูต้องเห็น Test จาก Contents ใน Classroom Details ได้ |
| T1-UT-002 | Unit Test แต่ละรายการต้องแสดงชื่อ test, unit, CEFR level, number of skills, total score และ estimated duration |
| T2-UT-003 | ครูต้องสามารถพรีวิว Test แต่ละอันได้ |
| T1-UT-004 | Teacher ต้องเห็นจำนวน part / จำนวนข้อของแต่ละ skill |
| T1-UT-005 | Teacher ต้องเห็น instruction ของแต่ละ skill |
| T1-UT-006 | Teacher ต้อง preview sample question ของแต่ละ skill ได้ |
| T1-UT-007 | Teacher ต้อง preview audio ใน Listening ได้ |
| T1-UT-08 | Teacher ต้อง preview reading text และ question ได้ |
| T1-UT-09 | Teacher ต้อง preview speaking prompt และ recording flow ได้ |
| T1-UT-010 | Teacher ต้อง preview writing prompt และ writing box ได้ |
| T1-UT-011 | Teacher ต้องเห็น answer key ของ Listening / Reading |
| T1-UT-012 | Teacher ต้องเห็น rubric ของ Speaking / Writing |
| T1-UT-013 | Teacher ต้อง preview Student View ได้ |
| T1-UT-014 | Preview mode ต้องไม่บันทึกคะแนนหรือ progress |
| T1-UT-015 | Teacher ต้องสามารถกด Assign Test ได้ |
| T1-UT-016 | Teacher ต้องตั้ง due date ของการ assigns ได้ |
| T1-UT-017 | Teacher ต้องเลือกได้ว่าจะให้นักเรียนทำครบ 4 skills หรือเลือกเฉพาะบาง skills |
| T1-UT-018 | Teacher ต้องเห็นสถานะของ test เช่น Not assigned, Assigned, In progress, Completed |
| T1-UT-019 | Teacher ต้องปิด/ปิด auto-submit เมื่อหมดเวลาที่กำหนดใน due date ได้ |

> ⚠️ Note: source has inconsistent IDs — `T2-UT-003` (should be T1), and `T1-UT-08` / `T1-UT-09` (missing leading zero / out of pattern).

---

### Module 14: Test

**1. Description**
Teacher สามารถมอบหมาย Unit Test และติดตามผลสอบของนักเรียนได้

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-TEST-001 | Teacher ต้องเห็น Unit Test ที่อยู่ใน course/unit |
| T1-TEST-002 | Teacher ต้อง assign Unit Test ให้นักเรียนได้ |
| T1-TEST-003 | Teacher ต้องกำหนดช่วงเวลาเปิด/ปิด test ได้ |
| T1-TEST-004 | Teacher ต้องตั้ง time limit ได้ถ้าจำเป็น |
| T1-TEST-005 | Teacher ต้องกำหนดจำนวนครั้งที่ทำได้ |
| T1-TEST-006 | Teacher ต้องดู class test result ได้ |
| T1-TEST-007 | Teacher ต้องดู student test result รายบุคคลได้ |
| T1-TEST-008 | Teacher ต้องดูคะแนนแยกตาม skill / topic ได้ถ้ามีข้อมูล |
| T1-TEST-009 | Teacher ต้อง export test result ได้ |
| T1-TEST-010 | Teacher ควรสามารถ assign retest หรือ review practice ได้ |
| T1-TEST-011 | Teacher ต้องเห็น status ของแต่ละคน เช่น Not started, In progress, Submitted, Absent, Late |
| T1-TEST-012 | Teacher ต้องกด Send results หลังจากตรวจแล้ว เพื่อให้นักเรียนเห็นคะแนน test ของตนเอง |

**3. Business Rules**
- Test result ต้องบันทึกแบบรายบุคคล
- Test ที่เริ่มแล้วควรมีระบบ save progress กันข้อมูลหาย

---

### Module 15: AI Assessment Review — Speaking / Writing

**1. Description**
Teacher สามารถมอบหมาย Unit Test และติดตามผลสอบของนักเรียนได้
> ⚠️ Note: description appears copied from Module 14; likely should describe AI Speaking/Writing assessment review.

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-AI-001 | ระบบต้องรองรับ AI Assessment สำหรับ Speaking task |
| T1-AI-002 | ระบบต้องรองรับ AI Assessment สำหรับ Writing task |
| T1-AI-003 | Teacher ต้องเห็นรายการงานที่ AI ประเมินแล้ว |
| T1-AI-004 | Teacher ต้องเห็น AI score / level / feedback |
| T1-AI-005 | Teacher ต้องเห็น rubric breakdown เช่น content, grammar, vocabulary, pronunciation, fluency |
| T1-AI-009 | Student ต้องเห็น feedback ทันทีหลังทำ activity ในกรณีที่ทำ assignment |
| T1-AI-011 | Student ต้องเห็น feedback ของ test หลังจากครู Send results แล้ว ในกรณี test |
| T1-AI-012 | ระบบควรมี AI usage limit ต่อห้อง / ต่อ task |

> ⚠️ Note: source skips IDs T1-AI-006…008 and T1-AI-010.

**3. Business Rules**
- AI feedback เป็น learning support ไม่ใช่ final judge
- Final score ต้องเป็นคะแนนที่ Teacher ยืนยันหรือแก้ไขได้
- Audio / writing data ต้องเก็บตาม policy ของระบบ

---

### Module 16: Report

**1. Description**
Reports ใช้ติดตามความก้าวหน้าของทั้งห้องและนักเรียนรายบุคคล

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-RP-001 | Teacher ต้องเห็น Class Overall Report |
| T1-RP-002 | Teacher ต้อง filter report ตาม class, unit, student, date range ได้ |
| T1-RP-003 | Teacher ต้องเห็น Class Progression |
| T1-RP-004 | Teacher ต้องเห็น Student Report รายบุคคล |
| T1-RP-005 | Report ต้องแสดง progress ของ unit / activity |
| T1-RP-006 | Report ต้องแสดง assignment result |
| T1-RP-007 | Report ต้องแสดง test result |
| T1-RP-008 | Report ควรแสดง skill breakdown เช่น vocabulary, grammar, listening, speaking, reading, writing |
| T1-RP-009 | Report ควรแสดง common mistakes |
| T1-RP-010 | Report ควรแสดง recommended next activity |
| T1-RP-011 | Teacher ต้อง export report ได้ เช่น PDF / Excel |

**3. Business Rules**
- Report ต้องแสดงผลทั้ง Classroom และ Student เป็นรายบุคคล
- Report ส่วนของ Student รายบุคคล ใช้ร่วมกับ Students Report Module
- Student-level report รายห้อง ต้องไม่แสดงให้นักเรียนเห็น
- Report ควรอัปเดตหลังจบ activity / assignment / test

---

### Module 17: Teacher Notification

**1. Description**
Teacher Notifications เป็นระบบแจ้งเตือนสำหรับครู เพื่อให้ครูทราบเหตุการณ์สำคัญที่เกิดขึ้นในห้องเรียน เช่น นักเรียนส่งงาน มีงานรอตรวจ ผล AI Assessment พร้อมตรวจทาน นักเรียนทำ Unit Test เสร็จ มีงานใกล้ถึงกำหนดส่ง หรือมีความคืบหน้าที่ควรติดตาม โดยครูสามารถดู notification ได้จาก Teacher Dashboard และ Notification Center

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| T1-NOTI-001 | ระบบต้องมี Notification Center สำหรับ Teacher |
| T1-NOTI-002 | Teacher ต้องเห็น notification icon บน dashboard หรือ navigation bar |
| T1-NOTI-003 | ระบบต้องแสดงจำนวน notification ที่ยังไม่ได้อ่าน |
| T1-NOTI-004 | Teacher ต้องสามารถเปิดดูรายการ notifications ทั้งหมดได้ |
| T1-NOTI-005 | Notification แต่ละรายการต้องแสดง title, short message, related class, time/date และ status |
| T1-NOTI-006 | Teacher ต้องสามารถกด notification เพื่อไปยังหน้าที่เกี่ยวข้องได้ |
| T1-NOTI-007 | ระบบต้องแจ้งเตือนเมื่อมีนักเรียนส่ง assignment ใหม่ |
| T1-NOTI-008 | ระบบต้องแจ้งเตือนเมื่อ assignment เลยกำหนดส่งและยังมีนักเรียนที่ยังไม่ส่ง |
| T1-NOTI-009 | ระบบต้องแจ้งเตือนเมื่อมีงานที่ต้องตรวจหรือรอให้คะแนน |
| T1-NOTI-010 | ระบบต้องแจ้งเตือนเมื่อมีนักเรียนทำ Unit Test เสร็จ |
| T1-NOTI-011 | ระบบต้องแจ้งเตือนเมื่อ Unit Test หมดเวลาทำแล้วและมีผลลัพธ์พร้อมดู |
| T1-NOTI-012 | Teacher ต้องสามารถตั้งค่า notification preferences ได้ |
| T1-NOTI-013 | ระบบต้องจัดกลุ่ม notification ที่เกี่ยวข้องกันเพื่อลดความซ้ำ เช่น "12 students submitted Task 1" แทนการแจ้งแยก 12 รายการ |

**3. Business Rules**
- Notification ต้องแสดงเฉพาะข้อมูลของ classroom ที่ Teacher มีสิทธิ์เข้าถึง
- Notification ที่เป็นรายการซ้ำควรถูก grouped เพื่อลด notification overload
- Teacher ต้องสามารถปิด notification บางประเภทได้จาก Settings

---

## Student Board — Module Details

### Module 1: Landing Page / Home

**1. Description**
Landing Page เป็นจุดเริ่มต้นสำหรับ Student เพื่อเข้าสู่ระบบหรือเข้าห้องเรียน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-LP-001 | Landing Page ต้องเปิดดูได้โดยไม่ต้อง login |
| S1-LP-002 | ต้องมี CTA สำหรับ Student เช่น "Login as Student" |
| S1-LP-003 | ต้องมีช่อง Join Class / Enter Code ถ้าระบบอนุญาตก่อน login |
| S1-LP-004 | ต้องอธิบายขั้นตอนการเข้าเรียนแบบง่าย |
| S1-LP-005 | ต้องรองรับภาษาไทยและภาษาอังกฤษ |
| S1-LP-006 | ต้องแสดงปุ่ม Help สำหรับนักเรียน |

**3. Business Rules**
- Student Dashboard ต้องเข้าผ่าน authentication
- Join code ต้องตรวจสอบกับ classroom ที่มีอยู่จริง

---

### Module 2: Onboarding

**1. Description**
Onboarding ช่วยให้นักเรียนเข้าใจวิธีใช้ระบบ เช่น เข้าห้องเรียน ทำกิจกรรม live ส่งงาน และดู feedback

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-OB-001 | ระบบต้องแสดง onboarding เมื่อนักเรียนเข้าใช้งานครั้งแรก |
| S1-OB-002 | Onboarding ต้องอธิบายวิธี join classroom |
| S1-OB-003 | Onboarding ต้องอธิบายวิธีทำ live activity |
| S1-OB-004 | Onboarding ต้องอธิบายวิธีส่ง assignment |
| S1-OB-005 | Onboarding ต้องอธิบายวิธีดู report / feedback |
| S1-OB-006 | Student ต้อง skip onboarding ได้ |
| S1-OB-008 | Student ต้องเปิด onboarding ซ้ำได้จาก Help |
| S1-OB-009 | ระบบต้องบันทึกสถานะ onboarding completion |

> ⚠️ Note: source skips ID S1-OB-007.

---

### Module 3: Placement Test

**1. Description**
Placement Test เป็นข้อสอบ Adaptive Test ที่จะช่วยประเมินระดับของผู้เรียนตาม CEFR หลังจากทำแล้วผลจะไปปรากฎใน Report

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-PL-001 | Student ต้องสามารถเริ่ม Quick Placement Test ได้จาก onboarding หรือ dashboard |
| S1-PL-002 | Student สามารถกดข้ามทำภายหลังได้ (กดทำได้ในหน้า Classroom) |
| S1-PL-003 | Placement Test ต้องแสดง instruction ก่อนเริ่ม |
| S1-PL-004 | ระบบแสดงข้อสอบจากคลัง ในรูปแบบ adaptive test (ปรับระดับตามความสามารถของ Student) |
| S1-PL-005 | Student ทำ Vocabulary Test รูปแบบ MCQ |
| S1-PL-006 | Student ทำ Grammar Test รูปแบบ MCQ |
| S1-PL-007 | Student ทำ Listening Test รูปแบบ MCQ, drop down |
| S1-PL-008 | Student ทำ Reading Test รูปแบบ MCQ, drop down |
| S1-PL-009 | Student ทำ Speaking Test รูปแบบ Read Aloud, Repeat Sentence, Describe a Picture, Answer Personal Questions |
| S1-PL-010 | Student ต้อง record voice ได้ |
| S1-PL-011 | ระบบต้องบันทึก audio response ได้ |
| S1-PL-012 | Student ทำ Writing Test รูปแบบ MCQ, drop down, short answers |
| S1-PL-013 | ระบบต้องบันทึกคำตอบของ Student |
| S1-PL-014 | ระบบต้องคำนวณผลระดับเบื้องต้น |
| S1-PL-015 | Student ต้องเห็นผลของตนเองในรูปแบบ Overall CEFR Level และแบบ breakdown ราย skill |
| S1-PL-016 | Teacher ต้องเห็นผล Placement Test ของนักเรียนในห้อง ใน Report |
| S1-PL-017 | ระบบควรบันทึก Placement Test result ไว้ใน My progress |

**3. Business Rules**
- Student ควรทำซ้ำได้เฉพาะเมื่อ Teacher หรือระบบอนุญาต

---

### Module 4: Classroom

**1. Description**
Classroom เป็นหน้าที่ผู้เรียนใช้ดู Class ของตนเอง กดเข้าร่วมบทเรียน ทำ assignment test และดู report แสดงความคืบหน้าและผลการเรียนรู้ของตนเอง

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-CR-001 | Student ต้องเข้าร่วม Classroom ผ่าน join code / link / qrcode ได้ |
| S1-CR-003 | ระบบต้องตรวจสอบและแจ้ง error ถ้า code ผิด หมดอายุ หรือห้องปิดรับ |
| S1-CR-004 | Student ต้องเห็นชื่อห้องก่อนกดยืนยัน join |
| S1-CR-005 | Student ต้องเข้าร่วมหลาย classroom ได้ |
| S1-CR-006 | Teacher ต้องเห็น Student ที่ join แล้วใน class list |
| S1-CR-007 | Student ต้องเห็น classroom ที่ตนเข้าร่วม |
| S1-CR-008 | Page ต้องแสดง Contents ที่มีรายละเอียด Course และ Unit list ทั้งหมด แต่ยังไม่มีสิทธิ์เข้าถึง จนกว่าครูจะมอบหมาย |
| S1-CR-009 | Student ต้องเห็น Notification Messages แจ้งเตือนเวลา Teacher มอบหมายบทเรียนหรืองาน |
| S1-CR-010 | Student ต้องสามารถกด Start Unit ที่ครูมอบหมายให้ได้ |
| S1-CR-011 | Student ต้องกด Resume learning ได้ |
| S1-CR-012 | Page ต้องแสดง Assignments งานที่ต้องส่ง |
| S1-CR-013 | Page ต้องแสดง Unit test ที่ต้องทำ |
| S1-CR-014 | Page ต้องแสดง Report สรุปผลการเรียนรู้ |

> ⚠️ Note: source skips ID S1-CR-002.

**3. Business Rules**
- Join code ต้องผูกกับ classroom เดียว
- ถ้า Teacher ปิดรับนักเรียนใหม่ Student ไม่ควร join ได้

---

### Module 5: Classroom Contents

**1. Description**
Student เห็น course และ unit ที่ Teacher เพิ่มไว้ในห้องเรียน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-CC-001 | Student ต้องเห็น course ที่อยู่ใน classroom |
| S1-CC-002 | Student ต้องเห็น unit list |
| S1-CC-003 | Student ต้องเห็น activity ที่สามารถเปิดเรียนได้ |
| S1-CC-004 | Student ต้องเห็น activity status เช่น not started, completed |
| S1-CC-005 | Student ต้องเห็น assignment และ unit test ที่เกี่ยวข้องกับ unit |
| S1-CC-006 | Student ต้อง resume activity ล่าสุดได้ |
| S1-CC-007 | Student ต้องไม่เห็น Teacher-only content เช่น answer key |

**3. Business Rules**
- Student เห็นเฉพาะ content ที่ Teacher เปิดให้เรียนหรืออยู่ใน course ของห้อง
- Answer key และ Teacher tools ต้องไม่แสดงใน Student View

---

### Module 6: Learning Mode

**1. Description**
Student Learning Mode เป็นหน้าที่นักเรียนใช้ follow teacher ระหว่างการสอนสด และตอบกิจกรรมที่ Teacher ส่งมา

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-LM-001 | Student ต้องเข้าร่วม live session ได้ |
| S1-LM-002 | Student ต้องเห็น current activity ที่ Teacher ส่งมา |
| S1-LM-003 | Student screen ต้องเปลี่ยนตาม Teacher navigation เมื่อเปิด follow mode |
| S1-LM-004 | Student ต้องเห็น instruction ของกิจกรรม |
| S1-LM-005 | Student ต้องตอบ activity ได้ตาม template ที่กำหนด |
| S1-LM-006 | Student ต้องเห็น timer ถ้า Teacher เปิด timer |
| S1-LM-007 | Student ต้องเห็นสถานะ submitted หลังตอบ |
| S1-LM-008 | Student ต้องเห็น feedback เมื่อ Teacher reveal answer หรือระบบเฉลย |
| S1-LM-009 | Student screen ต้องถูก lock ได้เมื่อ Teacher lock screen |
| S1-LM-010 | Student ต้อง reconnect กลับ live session ได้ถ้าเน็ตหลุด |

**3. Business Rules**
- Live activity ต้องผูกกับ active session
- Student ไม่ควรข้ามไปข้อถัดไปเองถ้า Teacher เปิด follow/lock mode

---

### Module 7: Activity Interaction
*(Module index name: Learning Mode: Activity Template)*

**1. Description**
Student สามารถตอบกิจกรรมหลากหลายรูปแบบ

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-AIN-001 | Student ต้องตอบ MCQ ได้ |
| S1-AIN-002 | Student ต้องตอบ True/False ได้ |
| S1-AIN-003 | Student ต้องทำ Matching ได้ |
| S1-AIN-004 | Student ต้องทำ Drag and Drop ได้ |
| S1-AIN-005 | Student ต้องทำ Fill in the Blank ได้ |
| S1-LM-006 | Student ต้องทำ Listen and Choose ได้ |
| S1-LM-007 | Student ต้องทำ Listen and Point ได้ เช่น tap คนใน family tree |
| S1-LM-008 | Student ต้องพิมพ์ short answer ได้ |
| S1-LM-009 | Student ต้องบันทึกเสียงสำหรับ speaking activity ได้ |
| S1-LM-010 | Student ต้องส่งคำตอบได้ |
| S1-LM-011 | Student ต้องเห็น feedback หลังส่งคำตอบตาม setting |
| S1-LM-012 | Student ต้อง retry ได้ถ้า Teacher หรือระบบอนุญาต |

> ⚠️ Note: source IDs switch prefix mid-table (S1-AIN-001…005 then S1-LM-006…012); likely all should be S1-AIN.

**3. Business Rules**
- Response ต้องบันทึกเป็นราย student
- Activity บางประเภทอาจให้ feedback ทันที บางประเภทต้องรอ Teacher
- Audio activity ต้องมี replay limit ได้ถ้า Teacher ตั้งค่า

---

### Module 8: Assignments

**1. Description**
Student ใช้ดูงานที่ได้รับมอบหมาย ส่งงาน รับ feedback และ resubmit ได้

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-AS-001 | Student ต้องเห็นรายการ assignments |
| _(no id)_ | Student ต้องเห็น instruction ของ assignment |
| _(no id)_ | Student ต้องเห็น due date |
| _(no id)_ | Student ต้องเห็น rubric ก่อนส่งงานถ้ามี |
| _(no id)_ | Student ต้องส่ง writing ผ่าน text box ได้ |
| _(no id)_ | Student ต้องส่ง speaking ผ่าน voice recording ได้ |
| _(no id)_ | Student ต้อง upload file ได้ถ้า assignment รองรับ |
| _(no id)_ | Student ต้อง submit assignment ได้ |
| _(no id)_ | Student ต้องเห็น submission status |
| _(no id)_ | Student ต้องเห็น feedback หลัง Teacher return |
| _(no id)_ | Student ต้องเห็น AI feedback ถ้างานนั้นใช้ AI Assessment |
| _(no id)_ | Student ต้อง resubmit ได้ถ้า Teacher อนุญาต |
| _(no id)_ | Student ต้องดู submission history ได้ |

> ⚠️ Note: only the first row has an ID (S1-AS-001) in the source; remaining rows are unnumbered.

**3. Business Rules**
- Student แก้งานหลัง submit ได้เฉพาะเมื่อระบบหรือ Teacher อนุญาต
- งานที่เกิน due date ต้องแสดงสถานะ late
- Feedback ที่ยังไม่ถูก return ไม่ควรแสดงให้นักเรียนเห็น

---

### Module 9: Test

**1. Description**
Student ใช้ทำ Unit Test ที่ Teacher มอบหมาย และดูผลสอบของตนเอง

**2. Functional Requirements**

#### 2.1 Test Overview

| ID | Requirement |
| --- | --- |
| S1-TEST-001 | Student ต้องเห็น Test ที่ได้รับมอบหมาย |
| S1-TEST-002 | Unit Test ต้องแสดงชื่อ test, unit, classroom, due date และ status |
| S1-TEST-003 | Unit Test ต้องแสดงจำนวน skills ที่ต้องทำ เช่น Listening, Reading, Speaking, Writing |
| S1-TEST-004 | Student ต้องเห็น test instruction ก่อนเริ่ม |
| S1-TEST-005 | Student ต้องเห็น time limit ถ้ามี |
| S1-TEST-006 | Student ต้องเริ่มทำ test ได้ในช่วงเวลาที่เปิด |
| S1-TEST-007 | Student ต้องตอบคำถามใน test ได้ |
| S1-TEST-008 | ระบบต้อง save answer ระหว่างทำ test |
| S1-TEST-009 | Student ต้อง submit test ได้ |
| S1-TEST-010 | Student ต้องเห็นผลสอบหลัง Teacher กด Send Results และดูย้อนหลังได้ |
| S1-TEST-011 | Student ต้องเห็น score breakdown และ explanation แต่ละ skills |
| S1-TEST-012 | Student ต้องเห็น Listening score |
| S1-TEST-013 | Student ต้องเห็น Reading score |
| S1-TEST-014 | Student ต้องเห็น Speaking score และ feedback |
| S1-TEST-015 | Student ต้องเห็น Writing score และ feedback |
| S1-TEST-016 | Student ต้อง review answer ได้ |

**Business Rules (Test Overview)**
- Student ต้องทำ test ได้ตามจำนวนครั้งที่ Teacher ตั้งค่า
- ถ้า test หมดเวลา ระบบควร auto-submit
- ผลสอบต้องแสดงเฉพาะของ student คนนั้น

#### 2.2 Listening Test
Listening section เป็นข้อสอบฟังแบบ computer-based มี audio player, replay limit, timer และคำถามรูปแบบต่าง ๆ

| ID | Requirement |
| --- | --- |
| S1-LT-001 | Student ต้องเห็น Listening section เป็น section แยก |
| S1-LT-002 | Student ต้องเห็น instruction ก่อนเริ่ม Listening |
| S1-LT-003 | Student ต้องกด play audio ได้ |
| S1-LT-004 | ระบบต้องแสดงจำนวนครั้งที่ฟังได้ถ้ามี replay limit |
| S1-LT-005 | ระบบต้องนับจำนวน replay ตาม setting ของ Teacher |
| S1-LT-006 | Student ต้องเห็น audio progress bar |
| S1-LT-007 | Student ต้องตอบคำถาม Listening ได้ตาม question type |
| S1-LT-008 | Student ต้องเปลี่ยนคำตอบได้ก่อน submit section |
| S1-LT-009 | ระบบต้องบันทึกคำตอบของ Student |
| S1-LT-010 | ระบบต้อง auto-save คำตอบระหว่างทำ Listening |
| S1-LT-011 | Student ต้องเห็น progress เช่น Question 3 of 10 |
| S1-LT-012 | Student ต้องเห็น timer ของ section ถ้ามี |
| S1-LT-013 | Student ต้องกด Submit Section หรือ Next Section ได้เมื่อทำครบ |
| S1-LT-014 | ระบบต้องแจ้งเตือนถ้ายังมีข้อที่ยังไม่ได้ตอบ |
| S1-LT-015 | Student ไม่ควรเห็น transcript ระหว่างทำ Listening Test |
| S1-LT-016 | Student สามารถเห็น transcript ได้เมื่อ review answer |

**Business Rules (Listening Test)**
- Audio replay limit ต้องเป็นไปตามระบบ
- Student ไม่ควรเข้าถึง audio script หรือ answer key ระหว่าง test
- Listening answers ควรถูก auto-scored หลัง submit
- ถ้า audio เล่นไม่ได้ ระบบต้องแจ้งปัญหาและให้ Student ขอความช่วยเหลือ

#### 2.3 Reading Test
Reading section เป็นข้อสอบอ่านแบบ computer-based มี reading passage และคำถามตาม CEFR level

| ID | Requirement |
| --- | --- |
| S1-RT-001 | Student ต้องเห็น Reading section เป็น section แยก |
| S1-RT-002 | Student ต้องเห็น instruction ก่อนเริ่ม Reading |
| S1-RT-003 | Student ต้องเห็น reading passage ใน layout ที่อ่านง่าย |
| S1-RT-004 | Student ต้องเห็นคำถามที่ผูกกับ passage |
| S1-RT-005 | Student ต้อง scroll passage ได้ถ้าข้อความยาว |
| S1-RT-006 | Student ต้องตอบคำถาม Reading ได้ตาม question type |
| S1-RT-007 | Student ต้องสามารถกลับไปอ่านข้อความขณะตอบคำถามได้ |
| S1-RT-008 | Student ต้องเปลี่ยนคำตอบได้ก่อน submit section ถ้า setting อนุญาต |
| S1-RT-009 | ระบบต้อง auto-save คำตอบระหว่างทำ Reading |
| S1-RT-010 | Student ต้องเห็น progress เช่น Question 5 of 12 |
| S1-RT-011 | Student ต้องเห็น timer ของ section ถ้ามี |
| S1-RT-012 | Student ต้องกด Submit Section หรือ Next Section ได้เมื่อทำครบ |
| S1-RT-013 | ระบบต้องแจ้งเตือนถ้ายังมีข้อที่ยังไม่ได้ตอบ |
| S1-RT-014 | Student ไม่ควรเห็น answer key หรือ explanation ระหว่าง test |
| S1-RT-015 | Student ต้องเห็น answer key เมื่อ review answer |

**Business Rules (Reading Test)**
- Reading answers ควรถูก auto-scored เป็นหลัก
- Short answer อาจต้องมี acceptable answers หรือถูก flag ให้ตรวจเพิ่มเติม
- Student ต้องเห็น passage และคำถามชัดเจนบนทุก device

#### 2.4 Speaking Test
Speaking section เป็นการสอบพูดแบบ computer-based โดยนักเรียนฟัง/อ่าน prompt แล้วอัดเสียงตอบ ระบบส่งเสียงที่อัดเข้าสู่ AI Assessment และให้ Teacher ตรวจทานก่อน release คะแนน

| ID | Requirement |
| --- | --- |
| S1-ST-001 | Student ต้องเห็น Speaking section เป็น section แยก |
| S1-ST-002 | Student ต้องเห็น instruction ก่อนเริ่ม Speaking |
| S1-ST-003 | Student ต้องทำ Mic Check ก่อนเริ่ม Speaking ถ้าระบบกำหนด |
| S1-ST-004 | Student ต้องเห็น speaking prompt ชัดเจน |
| S1-ST-005 | Student ต้องเห็น preparation time ถ้ามี |
| S1-ST-006 | Student ต้องเห็น response time ถ้ามี |
| S1-ST-007 | Student ต้องเห็นจำนวน recording attempts ที่เหลือ |
| S1-ST-008 | Student ต้องกด Start Recording ได้ |
| S1-ST-009 | Student ต้องกด Stop Recording ได้ ถ้า setting อนุญาต |
| S1-ST-010 | Student ต้องเห็น recording timer |
| S1-ST-011 | Student ต้อง playback เสียงของตนเองได้ถ้า setting อนุญาต |
| S1-ST-012 | Student ต้อง record ใหม่ได้ตามจำนวน attempts ที่ Teacher กำหนด |
| S1-ST-013 | Student ต้อง submit speaking response ได้ |
| S1-ST-014 | ระบบต้อง upload และบันทึก audio response ได้ |
| S1-ST-015 | ระบบต้องแจ้ง status ว่า audio uploaded / submitted สำเร็จ |
| S1-ST-016 | ระบบต้องแจ้ง error ถ้า mic permission ไม่พร้อมหรือ upload fail |
| S1-ST-017 | Student ต้องเห็นข้อความว่า speaking response จะได้รับ feedback หลังการประเมิน |
| S1-ST-018 | Student ไม่ควรเห็น AI feedback ระหว่างทำ test |
| S1-ST-019 | Student ต้องเห็น AI feedback หลัง Teacher กด send results |

**Business Rules (Speaking Test)**
- Student ต้องได้รับสิทธิ์ microphone จาก browser ก่อน record
- จำนวน recording attempts ต้องเป็นไปตาม setting ของ Teacher
- ถ้า Student record แล้วไม่กด submit แต่หมดเวลา ระบบควร auto-submit recording ล่าสุดถ้ามี
- Speaking feedback ต้องแสดงหลัง Teacher กด send result เท่านั้น
- Audio response ต้องถูกเก็บอย่างปลอดภัยตาม policy ของระบบ

#### 2.5 Writing Test
Writing section เป็นข้อสอบเขียนแบบ computer-based นักเรียนพิมพ์คำตอบใน text editor ระบบส่งคำตอบเข้าสู่ AI Assessment และ Teacher ตรวจทานก่อน release คะแนน

| ID | Requirement |
| --- | --- |
| S1-WT-001 | Student ต้องเห็น Writing section เป็น section แยก |
| S1-WT-002 | Student ต้องเห็น instruction ก่อนเริ่ม Writing |
| S1-WT-003 | Student ต้องเห็น writing prompt ชัดเจน |
| S1-WT-004 | Student ต้องเห็น word limit ถ้ามี |
| S1-WT-005 | Student ต้องเห็น writing text box |
| S1-WT-006 | Student ต้องพิมพ์คำตอบได้ |
| S1-WT-007 | ระบบต้องแสดง word count |
| S1-WT-008 | ระบบต้อง auto-save writing response ระหว่างทำ |
| S1-WT-009 | Student ต้องเห็น save status เช่น "Saved" หรือ "Saving…" |
| S1-WT-010 | Student ต้องแก้ไขคำตอบได้ก่อน submit |
| S1-WT-011 | Student ต้องกด submit writing response ได้ |
| S1-WT-012 | ระบบต้องแจ้งเตือนถ้าเขียนต่ำกว่าขั้นต่ำหรือเกิน word limit ถ้ามี |
| S1-WT-013 | ระบบต้องแจ้งเตือนก่อนออกจากหน้าโดยยังไม่ได้ submit |
| S1-WT-014 | Student ต้องเห็นข้อความว่า speaking response จะได้รับ feedback หลังการประเมิน |
| S1-WT-015 | Student ไม่ควรเห็น AI feedback ระหว่างทำ test |
| S1-WT-016 | Student ต้องเห็น AI feedback หลัง Teacher กด send results |

> ⚠️ Note: S1-WT-014 mentions "speaking response" — likely should read "writing response" (copied from Speaking section).

**Business Rules (Writing Test)**
- Writing response ต้อง auto-save เป็นระยะ
- Auto-save ไม่ถือเป็น final submission จนกว่า Student กด Submit หรือหมดเวลา
- Student ไม่ควรเห็น AI suggestions ระหว่างทำ Writing Test
- Writing feedback ต้องแสดงหลัง Teacher กด send results เท่านั้น

---

### Module 10: Student AI Feedback

**1. Description**
Student เห็น feedback จาก AI และ Teacher สำหรับ speaking/writing task เพื่อใช้ปรับปรุงงาน

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-SAF-001 | Student ต้องเห็น AI feedback หลังงานถูก return |
| S1-SAF-002 | Feedback ต้องแสดงคะแนนหรือระดับคุณภาพถ้ามี |
| S1-SAF-003 | Feedback ต้องแสดง what you did well |
| S1-SAF-004 | Feedback ต้องแสดง one thing to improve |
| S1-SAF-005 | Feedback ต้องแสดง suggested correction |
| S1-SAF-006 | Feedback ต้องแสดง next step |
| S1-SAF-007 | Student ต้องฟัง recording เดิมของตนเองได้ใน speaking task |
| S1-SAF-008 | Student ต้องแก้ไขหรือ record ใหม่ได้ถ้า resubmit เปิด |
| S1-SAF-009 | Student ต้องเห็น Teacher final comment แยกจาก AI suggestion |

**3. Business Rules**
- AI feedback ควรแสดงหลัง Teacher return งานแล้ว
- Student ไม่ควรเห็น internal AI scoring log
- Feedback ควรใช้ภาษาที่เข้าใจง่าย เหมาะกับระดับผู้เรียน

---

### Module 11: Student Report / My Progress

**1. Description**
Student เห็นความก้าวหน้าของตนเอง คะแนน รายงานทักษะ และสิ่งที่ควรฝึกต่อ

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-SR-001 | Student ต้องเห็น progress รวมของตนเอง |
| S1-SR-002 | Student ต้องเห็น unit completion |
| S1-SR-003 | Student ต้องเห็น assignment score |
| S1-SR-004 | Student ต้องเห็น unit test score |
| S1-SR-005 | Student ต้องเห็น breakdown skill progress |
| S1-SR-006 | Student ต้องเห็น good / weak points |
| S1-SR-007 | Student ต้องเห็น recommended practice |

**3. Business Rules**
- Student เห็นเฉพาะ report ของตนเอง
- Progress ต้องอัปเดตหลัง activity / assignment / test
- Recommendation ควรอิงจากข้อมูลที่มีในระบบ

---

### Module 12: Student Notification

**1. Description**
Notification แจ้งเตือนนักเรียนเกี่ยวกับ live class, assignments, due dates, test และ feedback

**2. Functional Requirements**

| ID | Requirement |
| --- | --- |
| S1-SN-001 | Student ต้องเห็น notification list ได้ |
| S1-SN-002 | ระบบต้องแจ้งเมื่อมี assignment ใหม่ |
| S1-SN-003 | ระบบต้องแจ้งเตือนก่อน due date |
| S1-SN-004 | ระบบต้องแจ้งเมื่อมี unit test ใหม่ |
| S1-SN-005 | ระบบต้องแจ้งเมื่อ Teacher send results |
| S1-SN-006 | ระบบต้องแจ้งเมื่อ live session กำลังจะเริ่ม ถ้ามี schedule |
| S1-SN-008 | Student ต้องเปิด notification และกดเพื่อลิงก์ไปยังหน้าที่เกี่ยวข้องได้ |

> ⚠️ Note: source skips ID S1-SN-007.

**3. Business Rules**
- Notification ต้องไม่รบกวนระหว่างทำ test
- Push notification ใช้ได้ตาม platform capability และ permission ของผู้ใช้

---

<!-- End of Phase 1 module details. -->


