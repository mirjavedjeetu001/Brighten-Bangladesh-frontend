import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { userCvsApi, cvTemplatesApi, CvTemplate, UserCv } from '../../api/cvs';
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff, User, Briefcase, GraduationCap, Code, Palette } from 'lucide-react';

export const CreateCvPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const cvId = id ? Number(id) : null;
  const isEdit = Boolean(cvId);

  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [themeColor, setThemeColor] = useState('#0f766e');
  const [cvData, setCvData] = useState<any>({
    title: '',
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    activities: [],
    languages: [],
    references: [],
    portfolio: [],
    personalSkills: [],
    sectionTitles: {},
    additionalSections: {},
  });

  const { data: templatesResponse, isLoading: templatesLoading } = useQuery({
    queryKey: ['cvTemplates'],
    queryFn: () => cvTemplatesApi.getAll(),
  });

  const templates = templatesResponse?.data || [];

  const { data: existingCvResponse, isLoading: cvLoading } = useQuery({
    queryKey: ['user-cv', cvId],
    queryFn: () => userCvsApi.getOne(cvId as number),
    enabled: isEdit,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => userCvsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cvs'] });
      navigate('/cv-maker');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id: cvIdToUpdate, payload }: { id: number; payload: any }) => userCvsApi.update(cvIdToUpdate, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cvs'] });
      navigate('/cv-maker');
    },
  });

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
    if (!isEdit && templates.length === 1) {
      setStep(2);
    }
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    const existingCv = existingCvResponse?.data as UserCv | undefined;
    if (existingCv) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // Remove /api suffix for static file URLs
      const baseUrl = apiBase.replace(/\/api$/, '');
      const existingPhoto = existingCv.personalInfo?.photo;
      const resolvedPhoto = existingPhoto
        ? (existingPhoto.startsWith('http') || existingPhoto.startsWith('data:') || existingPhoto.startsWith('blob:')
            ? existingPhoto
            : `${baseUrl}${existingPhoto}`)
        : '';
      setCvData({
        title: existingCv.title,
        personalInfo: { ...(existingCv.personalInfo || {}), photo: resolvedPhoto || existingCv.personalInfo?.photo },
        experience: existingCv.experience || [],
        education: existingCv.education || [],
        skills: existingCv.skills || [],
        certifications: existingCv.additionalSections?.certifications || [],
        projects: existingCv.additionalSections?.projects || [],
        activities: existingCv.additionalSections?.activities || [],
        languages: existingCv.languages || [],
        references: existingCv.additionalSections?.references || [],
        portfolio: existingCv.additionalSections?.portfolio || [],
        personalSkills: existingCv.additionalSections?.personalSkills || [],
        sectionTitles: existingCv.additionalSections?.sectionTitles || {},
        additionalSections: existingCv.additionalSections || {},
      });
      setSelectedTemplateId(existingCv.templateId);
      setProfilePicturePreview(resolvedPhoto);
      setThemeColor(existingCv.additionalSections?.themeColor || '#0f766e');
      setStep(2);
    }
  }, [existingCvResponse]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!cvData.personalInfo?.name || !cvData.personalInfo?.title || !cvData.personalInfo?.email) {
      alert('Please fill in Name, Job Title, and Email');
      return;
    }

    const activeTemplateId = selectedTemplateId || templates[0]?.id;
    if (!activeTemplateId) {
      alert('No active CV template is available.');
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      let photoUrl = '';
      if (profilePicture) {
        const formData = new FormData();
        formData.append('file', profilePicture);
        const uploadResponse = await fetch(`${apiBase}/uploads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const uploadedPath = uploadData.url || uploadData.path;
          if (uploadedPath) {
            // Store relative path in database (e.g., /uploads/filename.jpg)
            photoUrl = uploadedPath.startsWith('/uploads')
              ? uploadedPath
              : uploadedPath;
          }
        }
      } else if (cvData.personalInfo?.photo) {
        // Keep existing photo path as-is (it's already a relative path)
        photoUrl = cvData.personalInfo.photo;
      }

      const cleanExperience = (cvData.experience || []).filter((exp: any) => exp.position || exp.company || exp.startDate || exp.endDate).map((exp: any) => ({
        ...exp,
        responsibilities: exp.responsibilities || [],
      }));

      const cleanEducation = (cvData.education || []).filter((edu: any) => edu.degree || edu.institution || edu.graduationDate).map((edu: any) => ({
        ...edu,
      }));

      const cleanCertifications = (cvData.certifications || []).filter((cert: any) => cert.name || cert.issuer || cert.date || cert.license).map((cert: any) => ({
        ...cert,
      }));

      const cleanProjects = (cvData.projects || []).filter((proj: any) => proj.name || proj.description || proj.technologies || proj.url).map((proj: any) => ({
        ...proj,
      }));

      const cleanActivities = (cvData.activities || []).filter((act: any) => act.role || act.organization || act.period).map((act: any) => ({
        ...act,
      }));

      const cleanReferences = (cvData.references || []).filter((ref: any) => ref.name || ref.title || ref.organization || ref.contact).map((ref: any) => ({
        ...ref,
      }));

      const cleanPortfolio = (cvData.portfolio || []).filter((link: string) => !!link);
      const cleanPersonalSkills = (cvData.personalSkills || []).filter((skill: string) => !!skill);
      const cleanSectionTitles = cvData.sectionTitles || {};

      const cvPayload = {
        templateId: activeTemplateId,
        title: cvData.title || `${cvData.personalInfo.name}'s CV`,
        personalInfo: {
          ...cvData.personalInfo,
          photo: photoUrl || cvData.personalInfo.photo,
        },
        experience: cleanExperience,
        education: cleanEducation,
        skills: cvData.skills || [],
        languages: cvData.languages || [],
        additionalSections: {
          ...cvData.additionalSections,
          certifications: cleanCertifications,
          projects: cleanProjects,
          activities: cleanActivities,
          references: cleanReferences,
          portfolio: cleanPortfolio,
          personalSkills: cleanPersonalSkills,
          sectionTitles: cleanSectionTitles,
          themeColor,
        },
      };

      if (isEdit && cvId) {
        updateMutation.mutate({ id: cvId, payload: cvPayload });
      } else {
        createMutation.mutate(cvPayload);
      }
    } catch (error: any) {
      alert('Failed to save CV: ' + error.message);
    }
  };

  if (templatesLoading || (isEdit && cvLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/cv-maker')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6 font-medium transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  step >= s 
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-24 md:w-48 h-1.5 mx-3 rounded-full transition-all duration-300 ${
                    step > s ? 'bg-gradient-to-r from-teal-600 to-teal-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Create Your Professional CV
            </h1>
            <p className="text-gray-600 text-lg">
              {step === 1 && '✨ Choose your template (only one active template available)'}
              {step === 2 && (isEdit ? '📝 Update your CV details' : '📝 Fill in your details and watch your CV come to life')}
            </p>
          </div>
        </div>

        {/* Step 1: Select Template */}
        {step === 1 && (
          <div className="animate-fade-in">
            {templates.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-600">
                No active CV template found. Please create one in the CMS.
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {templates.map((template: CvTemplate) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 ${
                    selectedTemplateId === template.id ? 'ring-4 ring-teal-600 scale-105' : ''
                  }`}
                >
                  {selectedTemplateId === template.id && (
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-teal-600 to-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Selected
                    </div>
                  )}
                  
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {template.thumbnailUrl ? (
                      <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-24 mx-auto mb-3 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <div className="text-3xl">📄</div>
                        </div>
                        <span className="text-gray-400 text-sm">Template Preview</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 bg-gradient-to-br from-white to-gray-50">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (selectedTemplateId) {
                    setStep(2);
                  } else {
                    alert('Please select a template');
                  }
                }}
                disabled={!selectedTemplateId}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group"
              >
                Continue to Fill CV
                <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Edit CV Data */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-100">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {isEdit ? 'Edit Your CV' : 'Build Your CV'}
                  </h2>
                  <p className="text-gray-600">Fill in your information and watch the magic happen ✨</p>
                </div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                  {showPreview ? 'Hide Preview' : 'Show Live Preview'}
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3 mb-6">
                <div className="bg-white rounded-lg shadow border p-4 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CV Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Product Manager CV"
                    value={cvData.title || ''}
                    onChange={(e) => setCvData({ ...cvData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div className="bg-white rounded-lg shadow border p-4">
                  <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                    <Palette size={18} /> Theme Color
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="grid grid-cols-5 gap-2 flex-1">
                      {[ '#0f766e', '#2563eb', '#7c3aed', '#f97316', '#dc2626', '#0ea5e9', '#111827' ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setThemeColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${themeColor === color ? 'border-gray-900' : 'border-gray-200'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-12 h-12 border rounded"
                    />
                  </div>
                  <p className="text-xs text-gray-500">This accent color will be applied to headings and badges in the final CV and PDF.</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Section Titles (optional)</h3>
                <p className="text-sm text-gray-500 mb-4">Leave blank to use defaults. Customize labels like "Personal Activities & Competences".</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'summary', label: 'Summary' },
                    { key: 'skills', label: 'Skills' },
                    { key: 'certifications', label: 'Certifications & Licenses' },
                    { key: 'portfolio', label: 'Portfolio & Website' },
                    { key: 'experience', label: 'Experiences' },
                    { key: 'education', label: 'Education' },
                    { key: 'projects', label: 'Projects' },
                    { key: 'personalSkills', label: 'Personal Skills & Competences' },
                    { key: 'activities', label: 'Activities' },
                    { key: 'references', label: 'References' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        value={cvData.sectionTitles?.[item.key] || ''}
                        onChange={(e) => setCvData({ ...cvData, sectionTitles: { ...(cvData.sectionTitles || {}), [item.key]: e.target.value } })}
                        placeholder={`Custom label for ${item.label}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'}`}>
                {/* Form Section */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><User size={20} />Personal Information</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                      <div className="flex items-center gap-4">
                        {profilePicturePreview && (
                          <img src={profilePicturePreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-teal-600" />
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                          <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                          <span>{profilePicture ? 'Change Photo' : 'Upload Photo'}</span>
                        </label>
                        {profilePicture && (
                          <button
                            onClick={() => {
                              setProfilePicture(null);
                              setProfilePicturePreview('');
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input type="text" placeholder="Full Name *" value={cvData.personalInfo?.name || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, name: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="text" placeholder="Job Title *" value={cvData.personalInfo?.title || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, title: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="email" placeholder="Email *" value={cvData.personalInfo?.email || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, email: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="tel" placeholder="Phone" value={cvData.personalInfo?.phone || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, phone: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="text" placeholder="Location" value={cvData.personalInfo?.location || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, location: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="url" placeholder="LinkedIn" value={cvData.personalInfo?.linkedin || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, linkedin: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="url" placeholder="GitHub" value={cvData.personalInfo?.github || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, github: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <input type="url" placeholder="Website" value={cvData.personalInfo?.website || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, website: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      <textarea placeholder="Professional Summary" value={cvData.personalInfo?.summary || ''} onChange={(e) => setCvData({ ...cvData, personalInfo: { ...cvData.personalInfo, summary: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 h-24" />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2"><Briefcase size={20} />Experience</h3>
                      <button onClick={() => setCvData({ ...cvData, experience: [...(cvData.experience || []), { position: '', company: '', startDate: '', endDate: '', location: '', description: '', responsibilities: [] }] })} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"><Plus size={16} /> Add</button>
                    </div>
                    {(cvData.experience || []).map((exp: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-600">Experience #{idx + 1}</span>
                          <button onClick={() => setCvData({ ...cvData, experience: cvData.experience.filter((_: any, i: number) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                        <input type="text" placeholder="Position/Title" value={exp.position || ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].position = e.target.value; setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Company" value={exp.company || ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].company = e.target.value; setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input type="text" placeholder="Start Date (e.g., Jan 2021)" value={exp.startDate || ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].startDate = e.target.value; setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                          <input type="text" placeholder="End Date (e.g., Present)" value={exp.endDate || ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].endDate = e.target.value; setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <input type="text" placeholder="Location" value={exp.location || ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].location = e.target.value; setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <textarea placeholder="Description" value={exp.description || ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].description = e.target.value; setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm h-20" />
                        <textarea placeholder="Key Responsibilities (one per line)" value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : ''} onChange={(e) => { const updated = [...cvData.experience]; updated[idx].responsibilities = e.target.value.split('\n').filter(Boolean); setCvData({ ...cvData, experience: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20" />
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2"><GraduationCap size={20} />Education</h3>
                      <button onClick={() => setCvData({ ...cvData, education: [...(cvData.education || []), { degree: '', institution: '', graduationDate: '', details: '', gpa: '' }] })} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"><Plus size={16} /> Add</button>
                    </div>
                    {(cvData.education || []).map((edu: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-600">Education #{idx + 1}</span>
                          <button onClick={() => setCvData({ ...cvData, education: cvData.education.filter((_: any, i: number) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                        <input type="text" placeholder="Degree/Program" value={edu.degree || ''} onChange={(e) => { const updated = [...cvData.education]; updated[idx].degree = e.target.value; setCvData({ ...cvData, education: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Institution/University" value={edu.institution || ''} onChange={(e) => { const updated = [...cvData.education]; updated[idx].institution = e.target.value; setCvData({ ...cvData, education: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Graduation Date (e.g., 2022)" value={edu.graduationDate || ''} onChange={(e) => { const updated = [...cvData.education]; updated[idx].graduationDate = e.target.value; setCvData({ ...cvData, education: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="GPA/Grade (optional)" value={edu.gpa || ''} onChange={(e) => { const updated = [...cvData.education]; updated[idx].gpa = e.target.value; setCvData({ ...cvData, education: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <textarea placeholder="Details/Achievements" value={edu.details || ''} onChange={(e) => { const updated = [...cvData.education]; updated[idx].details = e.target.value; setCvData({ ...cvData, education: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20" />
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Code size={20} />Skills</h3>
                    <textarea placeholder="Enter skills separated by commas (e.g., JavaScript, Python, React)" value={Array.isArray(cvData.skills) ? cvData.skills.join(', ') : ''} onChange={(e) => setCvData({ ...cvData, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 h-20" />
                  </div>

                  {/* Certifications & Licenses */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Certifications & Licenses</h3>
                      <button onClick={() => setCvData({ ...cvData, certifications: [...(cvData.certifications || []), { name: '', issuer: '', date: '', license: '' }] })} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"><Plus size={16} /> Add</button>
                    </div>
                    {(cvData.certifications || []).map((cert: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-600">Certification #{idx + 1}</span>
                          <button onClick={() => setCvData({ ...cvData, certifications: cvData.certifications.filter((_: any, i: number) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                        <input type="text" placeholder="Name" value={cert.name || ''} onChange={(e) => { const updated = [...cvData.certifications]; updated[idx].name = e.target.value; setCvData({ ...cvData, certifications: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Issuer" value={cert.issuer || ''} onChange={(e) => { const updated = [...cvData.certifications]; updated[idx].issuer = e.target.value; setCvData({ ...cvData, certifications: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="License / Credential ID" value={cert.license || ''} onChange={(e) => { const updated = [...cvData.certifications]; updated[idx].license = e.target.value; setCvData({ ...cvData, certifications: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Date" value={cert.date || ''} onChange={(e) => { const updated = [...cvData.certifications]; updated[idx].date = e.target.value; setCvData({ ...cvData, certifications: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Projects</h3>
                      <button onClick={() => setCvData({ ...cvData, projects: [...(cvData.projects || []), { name: '', description: '', technologies: '', url: '' }] })} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"><Plus size={16} /> Add</button>
                    </div>
                    {(cvData.projects || []).map((proj: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-600">Project #{idx + 1}</span>
                          <button onClick={() => setCvData({ ...cvData, projects: cvData.projects.filter((_: any, i: number) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                        <input type="text" placeholder="Project Name" value={proj.name || ''} onChange={(e) => { const updated = [...cvData.projects]; updated[idx].name = e.target.value; setCvData({ ...cvData, projects: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <textarea placeholder="Description" value={proj.description || ''} onChange={(e) => { const updated = [...cvData.projects]; updated[idx].description = e.target.value; setCvData({ ...cvData, projects: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm h-20" />
                        <input type="text" placeholder="Technologies (comma separated)" value={proj.technologies || ''} onChange={(e) => { const updated = [...cvData.projects]; updated[idx].technologies = e.target.value; setCvData({ ...cvData, projects: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="URL" value={proj.url || ''} onChange={(e) => { const updated = [...cvData.projects]; updated[idx].url = e.target.value; setCvData({ ...cvData, projects: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>

                  {/* Portfolio & Website */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <h3 className="text-xl font-semibold mb-4">Portfolio & Website</h3>
                    <textarea
                      placeholder="Enter portfolio links, one per line"
                      value={(cvData.portfolio || []).join('\n')}
                      onChange={(e) => setCvData({ ...cvData, portfolio: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 h-24"
                    />
                  </div>

                  {/* Personal Skills & Competences */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <h3 className="text-xl font-semibold mb-4">Personal Skills & Competences</h3>
                    <textarea
                      placeholder="Enter personal skills, one per line"
                      value={(cvData.personalSkills || []).join('\n')}
                      onChange={(e) => setCvData({ ...cvData, personalSkills: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 h-24"
                    />
                  </div>

                  {/* Activities */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Activities</h3>
                      <button onClick={() => setCvData({ ...cvData, activities: [...(cvData.activities || []), { role: '', organization: '', period: '' }] })} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"><Plus size={16} /> Add</button>
                    </div>
                    {(cvData.activities || []).map((act: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-600">Activity #{idx + 1}</span>
                          <button onClick={() => setCvData({ ...cvData, activities: cvData.activities.filter((_: any, i: number) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                        <input type="text" placeholder="Role" value={act.role || ''} onChange={(e) => { const updated = [...cvData.activities]; updated[idx].role = e.target.value; setCvData({ ...cvData, activities: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Organization" value={act.organization || ''} onChange={(e) => { const updated = [...cvData.activities]; updated[idx].organization = e.target.value; setCvData({ ...cvData, activities: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Period" value={act.period || ''} onChange={(e) => { const updated = [...cvData.activities]; updated[idx].period = e.target.value; setCvData({ ...cvData, activities: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>

                  {/* References */}
                  <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">References</h3>
                      <button onClick={() => setCvData({ ...cvData, references: [...(cvData.references || []), { name: '', title: '', organization: '', contact: '' }] })} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"><Plus size={16} /> Add</button>
                    </div>
                    {(cvData.references || []).map((ref: any, idx: number) => (
                      <div key={idx} className="mb-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-600">Reference #{idx + 1}</span>
                          <button onClick={() => setCvData({ ...cvData, references: cvData.references.filter((_: any, i: number) => i !== idx) })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </div>
                        <input type="text" placeholder="Name" value={ref.name || ''} onChange={(e) => { const updated = [...cvData.references]; updated[idx].name = e.target.value; setCvData({ ...cvData, references: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Title" value={ref.title || ''} onChange={(e) => { const updated = [...cvData.references]; updated[idx].title = e.target.value; setCvData({ ...cvData, references: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Organization" value={ref.organization || ''} onChange={(e) => { const updated = [...cvData.references]; updated[idx].organization = e.target.value; setCvData({ ...cvData, references: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                        <input type="text" placeholder="Contact" value={ref.contact || ''} onChange={(e) => { const updated = [...cvData.references]; updated[idx].contact = e.target.value; setCvData({ ...cvData, references: updated }); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button onClick={handleSubmit} disabled={createMutation.isPending} className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                      <Save size={20} />
                      {createMutation.isPending ? 'Saving...' : 'Save CV'}
                    </button>
                  </div>
                </div>

                {/* Preview Section */}
                {showPreview && (
                  <div className="lg:sticky lg:top-4 lg:h-fit">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 overflow-auto max-h-[800px]">
                      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                      {(() => { const t = cvData.sectionTitles || {}; const titleFor = (k: string, d: string) => t[k] || d; const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'; const rawPhoto = profilePicturePreview || cvData.personalInfo?.photo; const isAbsolute = rawPhoto?.startsWith('http') || rawPhoto?.startsWith('data:') || rawPhoto?.startsWith('blob:'); const photoSrc = rawPhoto ? (isAbsolute ? rawPhoto : `${apiBase}${rawPhoto}`) : ''; return (
                      <div className="bg-white p-6 text-sm space-y-4">
                        {(cvData.personalInfo?.name || photoSrc) && (
                          <div className="border-b pb-4">
                            <div className="flex items-center gap-4 justify-center">
                              {photoSrc && (
                                <img src={photoSrc} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: themeColor }} />
                              )}
                              <div className="text-center">
                                {cvData.personalInfo?.name && <h1 className="text-2xl font-bold" style={{ color: themeColor }}>{cvData.personalInfo.name}</h1>}
                                {cvData.personalInfo?.title && <p className="text-lg text-gray-600">{cvData.personalInfo.title}</p>}
                              </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-gray-600">
                              {cvData.personalInfo?.email && <span>📧 {cvData.personalInfo.email}</span>}
                              {cvData.personalInfo?.phone && <span>📱 {cvData.personalInfo.phone}</span>}
                              {cvData.personalInfo?.location && <span>📍 {cvData.personalInfo.location}</span>}
                              {cvData.personalInfo?.linkedin && <span>💼 {cvData.personalInfo.linkedin}</span>}
                              {cvData.personalInfo?.github && <span>💻 {cvData.personalInfo.github}</span>}
                              {cvData.personalInfo?.website && <span>🌐 {cvData.personalInfo.website}</span>}
                            </div>
                          </div>
                        )}
                        
                        {cvData.personalInfo?.summary && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('summary', 'SUMMARY')}</h2>
                            <p className="text-xs text-gray-700">{cvData.personalInfo.summary}</p>
                          </div>
                        )}

                        {cvData.experience?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('experience', 'EXPERIENCE')}</h2>
                            {cvData.experience.map((exp: any, idx: number) => (
                              <div key={idx} className="mb-2">
                                <div className="font-semibold text-xs">{exp.position}</div>
                                <div className="text-xs text-gray-600">{exp.company} | {exp.startDate} - {exp.endDate}</div>
                                {exp.location && <div className="text-[11px] text-gray-500">{exp.location}</div>}
                              </div>
                            ))}
                          </div>
                        )}

                        {cvData.education?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('education', 'EDUCATION')}</h2>
                            {cvData.education.map((edu: any, idx: number) => (
                              <div key={idx} className="mb-2">
                                <div className="font-semibold text-xs">{edu.degree}</div>
                                <div className="text-xs text-gray-600">{edu.institution} | {edu.graduationDate}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {cvData.skills?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('skills', 'SKILLS')}</h2>
                            <div className="flex flex-wrap gap-2">
                              {cvData.skills.map((skill: string) => (
                                <span key={skill} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${themeColor}1a`, color: themeColor }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {cvData.certifications?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('certifications', 'CERTIFICATIONS & LICENSES')}</h2>
                            <ul className="space-y-1 text-xs text-gray-700">
                              {cvData.certifications.map((cert: any, idx: number) => (
                                <li key={idx}>
                                  <span className="font-semibold">{cert.name}</span>
                                  {cert.issuer && <span> - {cert.issuer}</span>}
                                  {cert.license && <span className="text-gray-500"> (License: {cert.license})</span>}
                                  {cert.date && <span className="text-gray-500"> · {cert.date}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {cvData.portfolio?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('portfolio', 'PORTFOLIO & WEBSITE')}</h2>
                            <ul className="space-y-1 text-xs text-gray-700">
                              {cvData.portfolio.map((link: string, idx: number) => (
                                <li key={idx}>{link}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {cvData.projects?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('projects', 'PROJECTS')}</h2>
                            <div className="space-y-2 text-xs text-gray-700">
                              {cvData.projects.map((proj: any, idx: number) => (
                                <div key={idx}>
                                  <div className="font-semibold">{proj.name}</div>
                                  {proj.description && <div>{proj.description}</div>}
                                  {proj.technologies && <div className="text-gray-500">Tech: {proj.technologies}</div>}
                                  {proj.url && <div className="text-gray-500">{proj.url}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {cvData.personalSkills?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('personalSkills', 'PERSONAL SKILLS & COMPETENCES')}</h2>
                            <div className="flex flex-wrap gap-2">
                              {cvData.personalSkills.map((skill: string) => (
                                <span key={skill} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: `${themeColor}1a`, color: themeColor }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {cvData.activities?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('activities', 'ACTIVITIES')}</h2>
                            <div className="space-y-2 text-xs text-gray-700">
                              {cvData.activities.map((act: any, idx: number) => (
                                <div key={idx}>
                                  <span className="font-semibold">{act.role}</span>
                                  {act.organization && <span> - {act.organization}</span>}
                                  {act.period && <div className="text-gray-500">{act.period}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {cvData.references?.length > 0 && (
                          <div>
                            <h2 className="font-bold border-b pb-1 mb-2" style={{ color: themeColor }}>{titleFor('references', 'REFERENCES')}</h2>
                            <div className="space-y-2 text-xs text-gray-700">
                              {cvData.references.map((ref: any, idx: number) => (
                                <div key={idx}>
                                  <div className="font-semibold">{ref.name}</div>
                                  {ref.title && <div>{ref.title}</div>}
                                  {ref.organization && <div>{ref.organization}</div>}
                                  {ref.contact && <div className="text-gray-500">{ref.contact}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      ); })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
