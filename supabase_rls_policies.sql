-- Enable RLS on the resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only select their own resumes
CREATE POLICY "Users can view their own resumes"
ON resumes FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own resumes
CREATE POLICY "Users can insert their own resumes"
ON resumes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own resumes
CREATE POLICY "Users can update their own resumes"
ON resumes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON resumes FOR DELETE
USING (auth.uid() = user_id);
