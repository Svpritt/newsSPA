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
    this.filterControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      if (value !== null) {
        this.newsService.setFilterKeywords(value);
      }
    });

    this.newsService.getFilteredArticles().subscribe(
      data => this.articles = data,
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
