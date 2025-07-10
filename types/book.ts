export;
interface Book { id: string;
title: string;
author: string isbn?: string;
category: string;
status: 'reading' | 'read' | 'want-to-read' rating: 1 | 2 | 3 | 4 | 5 startDate?: string finishDate?: string;
cover: string notes?: string takeaways?: string;
tags: string[];
publishYear?: number pages?: number language?: string }