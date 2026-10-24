import { describe, expect, it } from 'vitest';
import { favoriteWorkTasks } from './work-favorites';

const tasks = [{ task_id: 'a', name: 'one' }, { task_id: 'b', name: 'two' }];

describe('favoriteWorkTasks', () => {
  it('filters only current server task IDs, preserving task ordering', () => {
    expect(favoriteWorkTasks(tasks, ['b', 'deleted', 'b'])).toEqual([tasks[1]]);
  });
  it('does not invent favorites when the readback is unavailable', () => {
    expect(favoriteWorkTasks(tasks, null)).toEqual([]);
  });
});
