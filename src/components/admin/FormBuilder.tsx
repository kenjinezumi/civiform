/**
 * src/components/admin/FormBuilder.tsx
 *
 * Very short "orchestrator" of all the logic:
 * - Fetch & group questions
 * - Track expand/collapse sets
 * - Render each section group with <SectionCard />
 */

import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFormBuilderController } from '../../controllers/useFormBuilderController';
import { groupQuestionsBySection, SectionGroup } from '../../utils/groupQuestionsBySection';
import { SectionCard } from './SectionCard';

export default function FormBuilder() {
  const {
    formSchema,
    loading,
    error,
    addQuestion,
    insertQuestionAtIndex,
    updateTitle,
    updateDescription,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    saveForm,
  } = useFormBuilderController();

  // Group questions by last encountered 'section'
  const groups = groupQuestionsBySection(formSchema.questions);

  // Track expanded sets
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  function handleToggleSection(sectionIndex: number) {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) newSet.delete(sectionIndex);
      else newSet.add(sectionIndex);
      return newSet;
    });
  }

  function handleToggleQuestion(qIndex: number) {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qIndex)) newSet.delete(qIndex);
      else newSet.add(qIndex);
      return newSet;
    });
  }

  // Expand or collapse everything
  function handleExpandCollapseAll() {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      // expand all
      const secSet = new Set<number>();
      const qSet = new Set<number>();
      groups.forEach((g) => {
        if (g.sectionIndex !== null) secSet.add(g.sectionIndex);
        g.items.forEach((item) => qSet.add(item.index));
      });
      setExpandedSections(secSet);
      setExpandedQuestions(qSet);
    } else {
      // collapse all
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  }

  // Add question globally (unsectioned) at the end
  function handleAddQuestion() {
    addQuestion({ label: '', type: 'text' });
  }

  // Add a new section at the end
  function handleAddSection() {
    addQuestion({ label: 'New Section', type: 'section' });
  }

  // Insert question after all items in a group
  function handleAddQuestionInGroup(group: SectionGroup) {
    let insertIndex: number;
    if (group.sectionIndex !== null) {
      if (group.items.length > 0) {
        const lastChild = group.items[group.items.length - 1].index;
        insertIndex = lastChild + 1;
      } else {
        insertIndex = group.sectionIndex + 1;
      }
    } else {
      // unsectioned group
      if (group.items.length > 0) {
        const last = group.items[group.items.length - 1].index;
        insertIndex = last + 1;
      } else {
        insertIndex = formSchema.questions.length;
      }
    }
    insertQuestionAtIndex({ label: '', type: 'text' }, insertIndex);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {loading ? 'Loading...' : 'Form Builder (Modular)'}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Form Title/Desc */}
      <TextField
        label="Form Title"
        value={formSchema.title}
        onChange={(e) => updateTitle(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Form Description"
        value={formSchema.description}
        onChange={(e) => updateDescription(e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 2 }}
      />

      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={handleAddQuestion}>
          Add Unsectioned Question
        </Button>
        <Button variant="outlined" onClick={handleAddSection}>
          Create Section
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleExpandCollapseAll}
          startIcon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ ml: 'auto' }}
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {groups.map((group, gIdx) => (
        <SectionCard
          key={gIdx}
          group={group}
          expandedSections={expandedSections}
          expandedQuestions={expandedQuestions}
          onToggleSection={handleToggleSection}
          onToggleQuestion={handleToggleQuestion}
          updateQuestion={updateQuestion}
          moveQuestion={moveQuestion}
          removeQuestion={removeQuestion}
          onAddQuestionHere={() => handleAddQuestionInGroup(group)}
        />
      ))}

      <Divider sx={{ my: 3 }} />

      <Button variant="contained" onClick={saveForm} disabled={loading}>
        {loading ? 'Saving...' : 'Save Form'}
      </Button>
    </Box>
  );
}
