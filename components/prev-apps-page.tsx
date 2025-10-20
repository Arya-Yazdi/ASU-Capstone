import { db } from '@/utils/db/db';
import { appliedJobsTable, JobSelectType, jobTable } from '@/utils/db/schema';
import { useQuery } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from './ui/card';
import { DataTable } from './job-archive-Page/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from './ui/input';

export function PrevAppsPage() {
  const [filterParam, setFilterParam] = useState('');
  const columns: ColumnDef<JobSelectType & { dateApplied: Date }>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div className='overflow-hidden ml-4 overflow-ellipsis text-blue-700'>
            <a
              href={row.original.link}
              target='_blank'
              rel='noopener noreferrer'
            >
              {title}
            </a>
          </div>
        );
      },
    },
    {
      header: 'Location',
      cell: ({ row: { original } }) => (
        <div className='w-[16ch] overflow-hidden overflow-ellipsis'>
          {original.location}
        </div>
      ),
    },
    {
      accessorKey: 'employmentType',
      header: 'Employment',
    },
    {
      accessorKey: 'payrate',
      header: 'Pay',
      cell: ({ row: { original } }) => (
        <PayRate payrate={original.payrate} payType={original.payType} />
      ),
    },
    {
      accessorKey: 'dateApplied',
      header: 'Applied On',
      cell: ({ row }) => {
        const dateApplied = new Date(row.getValue('dateApplied') as string);
        return <span>{dateApplied.toLocaleDateString()}</span>;
      },
    },
    {
      header: 'Details',
      cell: ({ row: { original } }) => (
        <JobModal label='View' data={original} />
      ),
    },
  ];

  const { data } = useQuery({
    queryKey: ['prevApp'],
    queryFn: async () =>
      await db
        .select()
        .from(appliedJobsTable)
        .innerJoin(jobTable, eq(jobTable.id, appliedJobsTable.jobId)),
  });

  if (!data) return 'Loading...';

  const companies = [...new Set(data.map((d) => d.jobs.companyName))].filter(
    (el) => {
      if (!filterParam.length) return true;
      return el.toLowerCase().includes(filterParam.toLowerCase());
    }
  );

  return (
    <div className='p-12 grid gap-2'>
      <Input
        className='w-md'
        onChange={({ target: { value } }) => setFilterParam(() => value)}
        placeholder='🔍︎ Filter by company name.'
      />
      <Card className='p-6'>
        {companies.length ? (
          companies.map((company) => (
            <Accordion key={company} type='single' collapsible>
              <AccordionItem value={company}>
                <AccordionTrigger>{company}</AccordionTrigger>
                <AccordionContent>
                  <DataTable
                    columns={columns as ColumnDef<any>[]}
                    data={data
                      .filter((el) => el.jobs.companyName === company)
                      .map(({ jobs, applied_jobs: { dateApplied } }) => ({
                        ...jobs,
                        dateApplied,
                      }))}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))
        ) : (
          <div className='text-center text-lg'>No Data</div>
        )}
      </Card>
    </div>
  );
}
