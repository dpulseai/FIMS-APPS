-- Migration: create fims_anganwadi_forms table and supporting triggers
-- Generated: 2025-11-30

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fims_anganwadi_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inspection_id uuid NULL,
  anganwadi_name text NULL,
  anganwadi_number text NULL,
  supervisor_name text NULL,
  helper_name text NULL,
  village_name text NULL,
  room_availability boolean NULL,
  toilet_facility boolean NULL,
  drinking_water boolean NULL,
  electricity boolean NULL,
  kitchen_garden boolean NULL,
  weighing_machine boolean NULL,
  height_measuring_scale boolean NULL,
  first_aid_kit boolean NULL,
  teaching_materials boolean NULL,
  toys_available boolean NULL,
  attendance_register boolean NULL,
  growth_chart_updated boolean NULL,
  vaccination_records boolean NULL,
  nutrition_records boolean NULL,
  total_registered_children integer NULL DEFAULT 0,
  children_present_today integer NULL DEFAULT 0,
  children_0_3_years integer NULL DEFAULT 0,
  children_3_6_years integer NULL DEFAULT 0,
  hot_meal_served boolean NULL,
  take_home_ration boolean NULL,
  health_checkup_conducted boolean NULL,
  immunization_updated boolean NULL,
  vitamin_a_given boolean NULL,
  iron_tablets_given boolean NULL,
  general_observations text NULL,
  recommendations text NULL,
  action_required text NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  building_type text NULL,
  independent_kitchen boolean NULL DEFAULT false,
  women_health_checkup_space boolean NULL DEFAULT false,
  baby_weighing_scale boolean NULL DEFAULT false,
  hammock_weighing_scale boolean NULL DEFAULT false,
  adult_weighing_scale boolean NULL DEFAULT false,
  cooking_utensils boolean NULL DEFAULT false,
  water_storage_containers boolean NULL DEFAULT false,
  medicine_kits boolean NULL DEFAULT false,
  pre_school_kit boolean NULL DEFAULT false,
  all_registers boolean NULL DEFAULT false,
  monthly_progress_reports boolean NULL DEFAULT false,
  timetable_available boolean NULL DEFAULT false,
  timetable_followed boolean NULL DEFAULT false,
  supervisor_regular_attendance boolean NULL DEFAULT false,
  monthly_25_days_meals boolean NULL DEFAULT false,
  thr_provided_regularly boolean NULL DEFAULT false,
  food_provider text NULL,
  supervisor_participation text NULL,
  food_distribution_decentralized boolean NULL DEFAULT false,
  children_food_taste_preference text NULL,
  prescribed_protein_calories boolean NULL DEFAULT false,
  prescribed_weight_food boolean NULL DEFAULT false,
  lab_sample_date text NULL,
  regular_weighing boolean NULL DEFAULT false,
  growth_chart_accuracy boolean NULL DEFAULT false,
  vaccination_health_checkup_regular boolean NULL DEFAULT false,
  vaccination_schedule_awareness boolean NULL DEFAULT false,
  village_health_nutrition_planning text NULL,
  children_attendance_comparison text NULL,
  preschool_education_registered integer NULL DEFAULT 0,
  preschool_education_present integer NULL DEFAULT 0,
  preschool_programs_conducted text NULL,
  community_participation text NULL,
  committee_member_participation text NULL,
  home_visits_guidance text NULL,
  public_opinion_improvement text NULL,
  suggestions text NULL,
  visit_date text NULL,
  inspector_designation text NULL,
  inspector_name text NULL,
  village_health_nutrition_micro_planning text NULL,
  filled_by_name text NOT NULL DEFAULT ''::text,
  gp_name text NULL,
  block_name text NULL,
  ward_village_name text NULL,
  CONSTRAINT fims_anganwadi_forms_pkey PRIMARY KEY (id),
  CONSTRAINT fims_anganwadi_forms_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES fims_inspections (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Function: update_updated_at_column()
-- Ensures updated_at is set to now() on UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger: set updated_at before update
DROP TRIGGER IF EXISTS update_fims_anganwadi_forms_updated_at ON public.fims_anganwadi_forms;
CREATE TRIGGER update_fims_anganwadi_forms_updated_at
BEFORE UPDATE ON public.fims_anganwadi_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function: populate_filled_by_name()
-- Minimal helper: ensures filled_by_name is non-null (you can customize to derive from auth info)
CREATE OR REPLACE FUNCTION public.populate_filled_by_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.filled_by_name IS NULL THEN
    NEW.filled_by_name := '';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: populate filled_by_name before insert or update
DROP TRIGGER IF EXISTS populate_filled_by_name_trigger ON public.fims_anganwadi_forms;
CREATE TRIGGER populate_filled_by_name_trigger
BEFORE INSERT OR UPDATE ON public.fims_anganwadi_forms
FOR EACH ROW
EXECUTE FUNCTION public.populate_filled_by_name();

-- Optional indexes (add as needed)
CREATE INDEX IF NOT EXISTS idx_fims_anganwadi_forms_inspection_id ON public.fims_anganwadi_forms (inspection_id);

-- END OF MIGRATION
