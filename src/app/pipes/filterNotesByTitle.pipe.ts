import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterNotesByTitle',
  pure: false
})
export class FilterNotesByTitle implements PipeTransform {
  transform(items: any[], filter: string): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
  }
}
