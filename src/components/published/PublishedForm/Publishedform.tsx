import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // or your routing library
import { Button } from '@mui/material';
import { FormSchema } from '../../../types/formTypes';

interface PublishedFormProps {
  /** The fully loaded form data. You can fetch by ID or pass it in. */
  form: FormSchema;
}

/**
 * Renders a published (live) version of the form.
 * Each page is shown one at a time. Sections are visible, not collapsible.
 */
export function PublishedForm({ form }: PublishedFormProps) {
  // Track the current page
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // If you want to store user answers, you'd hold them in some state:
  //   answers: { [questionIdOrIndex]: string | string[] | number | etc. }
  // This is up to you how you design it.
  // For now, let's just render the form fields.
  
  const currentPage = form.pages[currentPageIndex];

  if (!currentPage) {
    return <div>Oops, no page found!</div>;
  }

  const goNext = () => {
    if (currentPageIndex < form.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{form.title}</h1>
      <p>{form.description}</p>

      <h2>{currentPage.title}</h2>
      {/* If you used rich text, you can dangerouslySetInnerHTML or a parser */}
      <p>{currentPage.description}</p>

      <hr />

      {/* 1) Show unsectioned questions */}
      {currentPage.unsectioned.map((q, qIndex) => (
        <div key={qIndex} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>
            {q.label} {q.required && '*'}
          </label>
          {/* 
            For the actual input, you'd switch on q.type (text, radio, etc.)
            For simplicity, let's do a text input here.
          */}
          <input type="text" />
        </div>
      ))}

      {/* 2) Show each section with its questions (not collapsible) */}
      {currentPage.sections.map((section, sIndex) => (
        <div key={sIndex} style={{ marginBottom: '2rem' }}>
          <h3>{section.title}</h3>
          {section.questions.map((q, qqIndex) => (
            <div key={qqIndex} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>
                {q.label} {q.required && '*'}
              </label>
              {/* Again, you'd switch on q.type to render the correct field */}
              <input type="text" />
            </div>
          ))}
        </div>
      ))}

      <hr />

      {/* Pagination / Navigation Buttons */}
      <div style={{ marginTop: '2rem' }}>
        {currentPageIndex > 0 && (
          <Button onClick={goPrev} variant="outlined" sx={{ mr: 2 }}>
            Previous
          </Button>
        )}
        {currentPageIndex < form.pages.length - 1 && (
          <Button onClick={goNext} variant="contained">
            Next
          </Button>
        )}
        {/* If you want to show a "Submit" on the last page: */}
        {currentPageIndex === form.pages.length - 1 && (
          <Button onClick={() => alert('Submit!')} variant="contained">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}
