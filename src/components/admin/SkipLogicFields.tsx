/**
 * src/components/admin/SkipLogicFields.tsx
 *
 * For editing skip logic fields
 */
import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { SkipLogicCondition, OperatorType, ActionType } from '../../types/formTypes';

interface SkipLogicProps {
  skip: SkipLogicCondition;
  onChange: (updated: SkipLogicCondition) => void;
}

export function SkipLogicFields({ skip, onChange }: SkipLogicProps) {
  // Local state to hold the "Ref Q#" as a string, so user can type freely
  const [localRef, setLocalRef] = useState(String(skip.referenceQuestionIndex));

  // Whenever `skip.referenceQuestionIndex` changes from parent,
  // update our localRef state (in case it was changed externally).
  useEffect(() => {
    setLocalRef(String(skip.referenceQuestionIndex));
  }, [skip.referenceQuestionIndex]);

  // Handlers
  const handleRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Let the user type any numeric string (including empty).
    setLocalRef(e.target.value);
  };

  const handleRefBlur = () => {
    // On blur, parse the localRef. If invalid or empty, default to 0
    const parsed = parseInt(localRef, 10);
    const val = isNaN(parsed) ? 0 : parsed;
    onChange({ ...skip, referenceQuestionIndex: val });
  };

  const handleOperator = (op: OperatorType) => {
    onChange({ ...skip, operator: op });
  };
  const handleValue = (val: string) => {
    onChange({ ...skip, value: val });
  };
  const handleAction = (act: ActionType) => {
    onChange({ ...skip, action: act });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      {/* Ref Q#: type="number" plus local string state */}
      <TextField
        label="Ref Q#"
        type="number"
        value={localRef}
        onChange={handleRefChange}
        onBlur={handleRefBlur}
        sx={{ width: 80 }}
        inputProps={{ min: 0 }}
      />

      <FormControl sx={{ width: 120 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          label="Operator"
          value={skip.operator}
          onChange={(e) => handleOperator(e.target.value as OperatorType)}
        >
          <MenuItem value="==">==</MenuItem>
          <MenuItem value="!=">!=</MenuItem>
          <MenuItem value="contains">contains</MenuItem>
          <MenuItem value="not-contains">not-contains</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Value"
        value={skip.value}
        onChange={(e) => handleValue(e.target.value)}
        sx={{ width: 80 }}
      />

      <FormControl sx={{ width: 90 }}>
        <InputLabel>Action</InputLabel>
        <Select
          label="Action"
          value={skip.action}
          onChange={(e) => handleAction(e.target.value as ActionType)}
        >
          <MenuItem value="show">Show</MenuItem>
          <MenuItem value="hide">Hide</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
