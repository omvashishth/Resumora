import React, { useState, useRef } from 'react';
import type { PersonalInfo } from '../../types/resume';
import { User, Mail, Phone, MapPin, Globe, Share2, Code2, Briefcase, Camera, Trash2, Crop } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PhotoUploadModal } from './PhotoUploadModal';
import { validateImageFile } from '../../utils/imageCropper';

interface PersonalEditorProps {
  personal: PersonalInfo;
  onChange: (update: Partial<PersonalInfo>) => void;
}

export const PersonalEditor: React.FC<PersonalEditorProps> = ({ personal, onChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateImageFile(file);

    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid image file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    onChange({ avatarUrl: '' });
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--color-border)] pb-3 mb-4">
        <h3 className="font-serif text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <User className="w-4 h-4 text-[var(--color-brand)]" /> Personal Information
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Essential contact details displayed at the top of your resume.
        </p>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-subtle)] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[var(--color-brand)]" /> Profile Photo (Optional)
          </span>
          <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
            JPG, PNG, WebP (Max 5MB)
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Avatar Thumbnail Preview */}
          {personal.avatarUrl ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-brand)] shrink-0 shadow-xs">
              <img
                src={personal.avatarUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shrink-0 flex items-center justify-center text-[var(--color-text-tertiary)]">
              <User className="w-7 h-7" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              {personal.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {personal.avatarUrl && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  leftIcon={<Crop className="w-3.5 h-3.5" />}
                >
                  Adjust
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemovePhoto}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/40 rounded-[var(--radius-subtle)] text-xs text-[var(--color-danger)] font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Hidden Cropper Modal */}
      <PhotoUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        file={selectedFile}
        onSavePhoto={(croppedUrl) => onChange({ avatarUrl: croppedUrl })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          requiredStar
          value={personal.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="e.g. Alex Morgan"
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Professional Title"
          value={personal.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Senior Software Engineer"
          leftIcon={<Briefcase className="w-4 h-4" />}
        />

        <Input
          label="Email Address"
          requiredStar
          type="email"
          value={personal.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="alex.morgan@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={personal.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+1 (555) 234-5678"
          leftIcon={<Phone className="w-4 h-4" />}
        />

        <Input
          label="Location"
          value={personal.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="San Francisco, CA"
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        <Input
          label="Personal Website / Blog"
          type="url"
          value={personal.website}
          onChange={(e) => onChange({ website: e.target.value })}
          placeholder="https://alexmorgan.dev"
          leftIcon={<Globe className="w-4 h-4" />}
        />

        <Input
          label="LinkedIn Profile"
          value={personal.linkedin}
          onChange={(e) => onChange({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/alexmorgan"
          leftIcon={<Share2 className="w-4 h-4" />}
        />

        <Input
          label="GitHub Profile"
          value={personal.github}
          onChange={(e) => onChange({ github: e.target.value })}
          placeholder="github.com/alexmorgan"
          leftIcon={<Code2 className="w-4 h-4" />}
        />
      </div>
    </div>
  );
};
