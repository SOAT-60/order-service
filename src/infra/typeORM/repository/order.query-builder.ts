import { AppDataSource } from "../config";

export async function findWithOrder(
  tableName: string,
  options: {
    criteria?: Record<string, any>;
    orderBy: Array<{
      field: string;
      direction: "ASC" | "DESC";
      customOrder?: Record<string, number>;
    }>;
    pagination?: {
      page: number;
      pageSize?: number;
    };
    relations?: string[];
  }
) {
  try {
    const repo = AppDataSource.getRepository(tableName);
    const query = repo.createQueryBuilder(tableName);
    const { criteria, orderBy, pagination } = options;
    const defaultPageSize = 10;

    if (criteria) {
      Object.keys(criteria).forEach((field) => {
        query.andWhere(`${tableName}.${field} = :${field}`, {
          [field]: criteria[field],
        });
      });
    }

    if (options.relations) {
      options.relations.forEach((relation) => {
        query.leftJoinAndSelect(`${tableName}.${relation}`, relation);
      });
    }

    orderBy.forEach((order, index) => {
      if (order.customOrder) {
        const cases = Object.entries(order.customOrder)
          .map(
            ([value, orderValue]) =>
              `WHEN ${order.field} = '${value}' THEN ${orderValue}`
          )
          .join(" ");

        const orderExpression = `(CASE ${cases} ELSE 999999 END)`;

        if (index === 0) {
          query.orderBy(orderExpression, order.direction);
        } else {
          query.addOrderBy(orderExpression, order.direction);
        }
      } else {
        if (index === 0) {
          query.orderBy(order.field, order.direction);
        } else {
          query.addOrderBy(order.field, order.direction);
        }
      }
    });

    if (pagination && pagination.page > 0) {
      const pageSize = pagination.pageSize || defaultPageSize;
      query.skip((pagination.page - 1) * pageSize).take(pageSize);
    }

    return query.getMany();
  } catch (error) {
    throw new Error(
      JSON.stringify({
        message: "Failed to fetch data from the database",
        status: error,
      })
    );
  }
}
