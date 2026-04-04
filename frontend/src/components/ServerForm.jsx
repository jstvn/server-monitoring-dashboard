const ServerForm = ({ formData, setFormData, onSubmit, loading, errorMessage, isEditMode }) => {
  const handleChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <form onSubmit={onSubmit} className="ui-form-card ui-shadow-soft">
      <h1 className="mb-5 text-center text-2xl font-semibold tracking-tight text-slate-900">
        {isEditMode ? 'Edit Server' : 'Add Server'}
      </h1>

      <input
        type="text"
        placeholder="Server Name"
        value={formData.name}
        onChange={handleChange('name')}
        className="ui-input"
        required
      />

      <input
        type="text"
        placeholder="Host"
        value={formData.host}
        onChange={handleChange('host')}
        className="ui-input"
        required
      />

      <input
        type="number"
        placeholder="Port"
        min="1"
        max="65535"
        value={formData.port}
        onChange={handleChange('port')}
        className="ui-input"
        required
      />

      <input
        type="text"
        placeholder="SSH Username"
        value={formData.sshUser}
        onChange={handleChange('sshUser')}
        className="ui-input"
        required
      />

      <div className="relative mb-4">
        <select
          value={formData.authType}
          onChange={handleChange('authType')}
          className="ui-input mb-0 appearance-none pr-10"
          required
        >
          <option value="password">Password</option>
          <option value="key">Key</option>
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 8 4 4 4-4" />
        </svg>
      </div>

      {formData.authType === 'key' ? (
        <input
          type="text"
          placeholder="Key Name (optional)"
          value={formData.keyName}
          onChange={handleChange('keyName')}
          className="ui-input"
        />
      ) : null}

      <textarea
        placeholder={formData.authType === 'key' ? 'Auth Secret (key content)' : 'Auth Secret'}
        value={formData.authSecret}
        onChange={handleChange('authSecret')}
        className="ui-input min-h-[90px] resize-y"
        required
      />

      {errorMessage ? <p className="mb-3 text-sm text-rose-600">{errorMessage}</p> : null}

      <button type="submit" className="ui-btn-primary" disabled={loading}>
        {loading ? 'Saving...' : isEditMode ? 'Update Server' : 'Create Server'}
      </button>
    </form>
  );
};

export default ServerForm;
