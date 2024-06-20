import { Component, OnInit } from '@angular/core';
import { NewsService } from 'src/app/services/news.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
  articles: any[] = [];
  filterControl = new FormControl('');


  constructor(private newsService: NewsService) {}
  ngOnInit(): void {
    this.fetchArticles();

    const currentFilterValue = this.newsService.getCurrentFilterValue();
    if (currentFilterValue) {
      this.filterControl.setValue(currentFilterValue);
    }

    this.filterControl.valueChanges.pipe(
      debounceTime(350)
    ).subscribe(value => {
      if (value !== null) {
        this.newsService.setFilterKeywords(value);
      }
    });

    this.newsService.getFilteredArticles().subscribe(
      data => {
        this.articles = data; // its refreshing the articles
        console.log(this.articles)
      },
      error => console.error('Error fetching articles:', error)
    );

    
  
  }
  fetchArticles(): void {
    this.newsService.getArticles().subscribe(
      data => this.articles = data,
      error => console.error('Error fetching articles:', error)
    );
    
  }

}



//first try but after i`m learning how to use ngModel angular material

// highlightKeywords(text: string): string {
//   const keywords = this.filterControl.value?.toLowerCase();
//   if (!keywords) {
//     return text;
//   }

//   const pattern = new RegExp(keywords, 'gi');
//   return text.replace(pattern, match => `<span class="highlight">${match}</span>`);
// }
