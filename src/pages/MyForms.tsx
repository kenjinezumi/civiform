/**
 * src/pages/MyForms.tsx
 *
 * A page that lists all forms. Each tile is full width (one item per row).
 * Features:
 * - Search by title
 * - Sort by title/date/due_date
 * - Filter by "all/published/draft"
 * - Multi-select filter by country
 * - Displays published/draft chip on each tile
 * - Preview, Edit, Delete, "Manage Access", and now shows due_date
 */

import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Button,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// OPTIONAL ICON for Access
// import LockOpenIcon from "@mui/icons-material/LockOpen"; 
// or use another relevant icon if you prefer

// Updated interface to include due_date
interface FormData {
  id: number;
  title: string;
  description?: string;
  published?: boolean;
  updated_at?: string;
  country?: string;
  /** The due date (ISO string) from the backend, if provided */
  due_date?: string;
}

// For sorting
type SortOption =
  | "title-asc"
  | "title-desc"
  | "date-latest"
  | "date-oldest"
  | "due-latest"
  | "due-oldest";

// For published filtering
type PublishedFilter = "all" | "published" | "draft";

export default function MyForms() {
  const navigate = useNavigate();

  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Title-based search + sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("title-asc");

  // Published/draft filter
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>("all");

  // Multi-select for countries
  const [countryFilter, setCountryFilter] = useState<string[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://127.0.0.1:8000/forms");
        setForms(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  // --- Handlers ---

  const handleEditClick = (formId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/admin/forms/builder/${formId}`);
  };

  const handleDeleteClick = async (formId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/forms/${formId}`);
      setForms((prev) => prev.filter((f) => f.id !== formId));
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Preview -> /forms/preview/:id
  const handlePreviewClick = (formId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/forms/preview/${formId}`);
  };

  // Manage Access -> e.g. /admin/forms/access/:formId
  const handleManageAccessClick = (formId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/admin/forms/access/${formId}`);
  };

  // Searching
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Sorting
  const handleSortChange = (e: SelectChangeEvent) => {
    setSortOption(e.target.value as SortOption);
  };

  // Published filter
  const handlePublishedFilterChange = (e: SelectChangeEvent) => {
    setPublishedFilter(e.target.value as PublishedFilter);
  };

  // Country multi-select filter
  const handleCountryFilterChange = (e: SelectChangeEvent<string[]>) => {
    setCountryFilter(e.target.value as string[]);
  };

  // If still loading
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Collect distinct country values (non-empty)
  const uniqueCountries = Array.from(
    new Set(forms.map((f) => f.country).filter(Boolean))
  ) as string[];

  // 1) Filter by title
  let filtered = forms.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2) Filter by published/draft if not "all"
  filtered = filtered.filter((f) => {
    if (publishedFilter === "all") return true;
    if (publishedFilter === "published") return f.published === true;
    if (publishedFilter === "draft") return !f.published;
    return true; // fallback
  });

  // 3) Filter by country if countryFilter not empty
  if (countryFilter.length > 0) {
    filtered = filtered.filter(
      (f) => f.country && countryFilter.includes(f.country)
    );
  }

  // 4) Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);

      case "date-latest":
        // "Newest updated_at" first
        return (
          (b.updated_at ? new Date(b.updated_at).getTime() : 0) -
          (a.updated_at ? new Date(a.updated_at).getTime() : 0)
        );
      case "date-oldest":
        // "Oldest updated_at" first
        return (
          (a.updated_at ? new Date(a.updated_at).getTime() : 0) -
          (b.updated_at ? new Date(b.updated_at).getTime() : 0)
        );

      // NEW: Sort by due_date (descending or ascending)
      case "due-latest":
        // Items with the newest due_date first
        return (
          (b.due_date ? new Date(b.due_date).getTime() : 0) -
          (a.due_date ? new Date(a.due_date).getTime() : 0)
        );
      case "due-oldest":
        // Items with the oldest due_date first
        return (
          (a.due_date ? new Date(a.due_date).getTime() : 0) -
          (b.due_date ? new Date(b.due_date).getTime() : 0)
        );

      default:
        return 0;
    }
  });

  // Render
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Forms
      </Typography>

      {/* Top bar: Search, sort, published filter, multi-select country, create form */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {/* Search by title */}
        <TextField
          label="Search Title"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* Sort */}
        <FormControl size="small">
          <InputLabel>Sort By</InputLabel>
          <Select value={sortOption} onChange={handleSortChange} label="Sort By">
            <MenuItem value="title-asc">Title (A-Z)</MenuItem>
            <MenuItem value="title-desc">Title (Z-A)</MenuItem>
            <MenuItem value="date-latest">Updated (Latest)</MenuItem>
            <MenuItem value="date-oldest">Updated (Oldest)</MenuItem>
            {/* NEW due_date sort options */}
            <MenuItem value="due-latest">Due Date (Latest)</MenuItem>
            <MenuItem value="due-oldest">Due Date (Oldest)</MenuItem>
          </Select>
        </FormControl>

        {/* Published filter */}
        <FormControl size="small">
          <InputLabel>Filter</InputLabel>
          <Select
            value={publishedFilter}
            onChange={handlePublishedFilterChange}
            label="Filter"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>

        {/* Multi-select for Country */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Countries</InputLabel>
          <Select
            multiple
            value={countryFilter}
            onChange={handleCountryFilterChange}
            label="Countries"
            input={<OutlinedInput label="Countries" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {uniqueCountries.map((countryName) => (
              <MenuItem key={countryName} value={countryName}>
                {countryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Create new form */}
        <Button
          variant="contained"
          onClick={() => navigate("/admin/forms/builder/new")}
        >
          Create New Form
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {sorted.length === 0 ? (
        <Typography>No forms match your search/filter.</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {sorted.map((form) => (
            <Grid key={form.id} item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { backgroundColor: "#f7f7f7" },
                }}
                onClick={() => handleEditClick(form.id)}
              >
                <Typography variant="h6">
                  {form.title} (ID: {form.id})
                </Typography>

                {/* Published/Draft Chip */}
                {form.published ? (
                  <Chip
                    label="Published"
                    color="success"
                    size="small"
                    sx={{ mt: 1, mr: 1 }}
                  />
                ) : (
                  <Chip
                    label="Draft"
                    color="warning"
                    size="small"
                    sx={{ mt: 1, mr: 1 }}
                  />
                )}

                {/* Optional description, country, etc. */}
                {form.description && (
                  <Typography variant="body2" color="text.secondary">
                    {form.description}
                  </Typography>
                )}
                {form.country && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Country:</strong> {form.country}
                  </Typography>
                )}

                {/* NEW: show due_date if present */}
                {form.due_date && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Due Date:</strong>{" "}
                    {new Date(form.due_date).toLocaleDateString()}
                  </Typography>
                )}

                {form.updated_at && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Last Updated:{" "}
                    {new Date(form.updated_at).toLocaleString()}
                  </Typography>
                )}

                {/* Buttons: Preview, Edit, Delete, Manage Access */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                    gap: 1,
                  }}
                >
                  {/* Preview */}
                  <IconButton
                    size="small"
                    onClick={(e) => handlePreviewClick(form.id, e)}
                  >
                    <VisibilityIcon />
                  </IconButton>

                  {/* Manage Access (New) */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => handleManageAccessClick(form.id, e)}
                  >
                    Manage Access
                  </Button>

                  {/* Edit */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleEditClick(form.id, e)}
                  >
                    <EditIcon />
                  </IconButton>

                  {/* Delete */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteClick(form.id, e)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
