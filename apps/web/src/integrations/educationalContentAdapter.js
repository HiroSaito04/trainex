import { getComponent, listLessonsForComponent, listGlossaryForComponent } from '@trainex/educational-content';

/**
 * Read-only adapter for linking simulator component selections to educational pages.
 * No simulation state or model geometry is modified.
 */
export function getComponentHelp(componentId) {
 const component=getComponent(componentId);
 if(!component)return null;
 return {
  componentId:component.id,
  title:component.title,
  description:component.summary,
  href:`/learn/components/${component.slug}`,
  lessons:listLessonsForComponent(component.id).map(lesson=>({
   id:lesson.id,title:lesson.title,href:`/learn/lessons/${lesson.id}`,
  })),
  glossary:listGlossaryForComponent(component.id).map(entry=>entry.term),
 };
}
